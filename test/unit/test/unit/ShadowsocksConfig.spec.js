define(["require", "exports", "chai", "../../ShadowsocksConfig"], function (require, exports, chai_1, ShadowsocksConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('ShadowsocksConfig', () => {
        describe('validator', () => {
            it('throws on empty port', () => {
                chai_1.expect(() => new ShadowsocksConfig_1.Port('')).to.throw(ShadowsocksConfig_1.ShadowsocksConfigError);
            });
            it('throws on invalid port', () => {
                chai_1.expect(() => new ShadowsocksConfig_1.Port('not a port')).to.throw(ShadowsocksConfig_1.ShadowsocksConfigError);
                chai_1.expect(() => new ShadowsocksConfig_1.Port('-123')).to.throw(ShadowsocksConfig_1.ShadowsocksConfigError);
                chai_1.expect(() => new ShadowsocksConfig_1.Port('123.4')).to.throw(ShadowsocksConfig_1.ShadowsocksConfigError);
            });
            it('normalizes non-normalized but valid port', () => {
                chai_1.expect(new ShadowsocksConfig_1.Port('01234').toString()).to.equal('1234');
            });
        });
        describe('URI serializer', () => {
            it('can serialize a SIP002 URI', () => {
                const config = new ShadowsocksConfig_1.ShadowsocksConfig({
                    host: new ShadowsocksConfig_1.Host('192.168.100.1'),
                    port: new ShadowsocksConfig_1.Port('8888'),
                    method: new ShadowsocksConfig_1.Method('aes-128-gcm'),
                    password: new ShadowsocksConfig_1.Password('test'),
                    tag: new ShadowsocksConfig_1.Tag('Foo Bar'),
                });
                chai_1.expect(new ShadowsocksConfig_1.Sip002URI(config).toString()).to.equal('ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
            });
            it('can serialize a legacy base64 URI', () => {
                const config = new ShadowsocksConfig_1.ShadowsocksConfig({
                    host: new ShadowsocksConfig_1.Host('192.168.100.1'),
                    port: new ShadowsocksConfig_1.Port('8888'),
                    method: new ShadowsocksConfig_1.Method('bf-cfb'),
                    password: new ShadowsocksConfig_1.Password('test'),
                    tag: new ShadowsocksConfig_1.Tag('Foo Bar'),
                });
                chai_1.expect(new ShadowsocksConfig_1.LegacyBase64URI(config).toString()).to.equal('ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar');
            });
        });
        describe('URI parser', () => {
            it('can parse a valid SIP002 URI with no plugin param', () => {
                const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
                const parseResult = ShadowsocksConfig_1.ShadowsocksURI.parse(input);
                chai_1.expect(parseResult.method.toString()).to.equal('aes-128-gcm');
                chai_1.expect(parseResult.password.toString()).to.equal('test');
                chai_1.expect(parseResult.host.toString()).to.equal('192.168.100.1');
                chai_1.expect(parseResult.port.toString()).to.equal('8888');
                chai_1.expect(parseResult.tag.toString()).to.equal('Foo Bar');
            });
            it('can parse a valid SIP002 URI with a plugin param', () => {
                const input = 'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp#Foo%20Bar';
                const parseResult = ShadowsocksConfig_1.ShadowsocksURI.parse(input);
                chai_1.expect(parseResult.method.toString()).to.equal('rc4-md5');
                chai_1.expect(parseResult.password.toString()).to.equal('passwd');
                chai_1.expect(parseResult.host.toString()).to.equal('192.168.100.1');
                chai_1.expect(parseResult.port.toString()).to.equal('8888');
                chai_1.expect(parseResult.tag.toString()).to.equal('Foo Bar');
                chai_1.expect(parseResult.plugin.toString()).to.equal('obfs-local;obfs=http');
            });
            it('can parse a valid legacy base64 URI', () => {
                const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
                const parseResult = ShadowsocksConfig_1.ShadowsocksURI.parse(input);
                chai_1.expect(parseResult.method.toString()).to.equal('bf-cfb');
                chai_1.expect(parseResult.password.toString()).to.equal('test');
                chai_1.expect(parseResult.host.toString()).to.equal('192.168.100.1');
                chai_1.expect(parseResult.port.toString()).to.equal('8888');
                chai_1.expect(parseResult.tag.toString()).to.equal('Foo Bar');
            });
            it('throws when parsing empty input', () => {
                chai_1.expect(() => ShadowsocksConfig_1.ShadowsocksURI.parse('')).to.throw(ShadowsocksConfig_1.InvalidShadowsocksURI);
            });
            it('throws when parsing invalid input', () => {
                chai_1.expect(() => ShadowsocksConfig_1.ShadowsocksURI.parse('not a URI')).to.throw(ShadowsocksConfig_1.InvalidShadowsocksURI);
                chai_1.expect(() => ShadowsocksConfig_1.ShadowsocksURI.parse('ss://not-base64')).to.throw(ShadowsocksConfig_1.InvalidShadowsocksURI);
            });
        });
    });
});
