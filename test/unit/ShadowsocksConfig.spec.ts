/// <reference types="chai" />
/// <reference types="mocha" />

import { expect } from 'chai';

import {
  Host, Port, Method, Password, Tag,
  ShadowsocksConfig, ShadowsocksURI, Sip002URI, LegacyBase64URI,
  ShadowsocksConfigError, InvalidShadowsocksURI,
} from '../../ShadowsocksConfig';

describe('ShadowsocksConfig', () => {

  describe('validator', () => {

    it('throws on empty port', () => {
      expect(() => new Port('')).to.throw(ShadowsocksConfigError);
    });

    it('throws on invalid port', () => {
      expect(() => new Port('not a port')).to.throw(ShadowsocksConfigError);
      expect(() => new Port('-123')).to.throw(ShadowsocksConfigError);
      expect(() => new Port('123.4')).to.throw(ShadowsocksConfigError);
    });

    it('normalizes non-normalized but valid port', () => {
      expect(new Port('01234').toString()).to.equal('1234');
    });

  });

  describe('URI serializer', () => {

    it('can serialize a SIP002 URI', () => {
      const config = new ShadowsocksConfig({
        host: new Host('192.168.100.1'),
        port: new Port('8888'),
        method: new Method('aes-128-gcm'),
        password: new Password('test'),
        tag: new Tag('Foo Bar'),
      });
      expect(new Sip002URI(config).toString()).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
    });

    it('can serialize a legacy base64 URI', () => {
      const config = new ShadowsocksConfig({
        host: new Host('192.168.100.1'),
        port: new Port('8888'),
        method: new Method('bf-cfb'),
        password: new Password('test'),
        tag: new Tag('Foo Bar'),
      });
      expect(new LegacyBase64URI(config).toString()).to.equal(
        'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar');
    });
  });

  describe('URI parser', () => {

    it('can parse a valid SIP002 URI with no plugin param', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method.toString()).to.equal('aes-128-gcm');
      expect(parseResult.password.toString()).to.equal('test');
      expect(parseResult.host.toString()).to.equal('192.168.100.1');
      expect(parseResult.port.toString()).to.equal('8888');
      expect(parseResult.tag.toString()).to.equal('Foo Bar');
    });

    it('can parse a valid SIP002 URI with a plugin param', () => {
      const input =
        'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method.toString()).to.equal('rc4-md5');
      expect(parseResult.password.toString()).to.equal('passwd');
      expect(parseResult.host.toString()).to.equal('192.168.100.1');
      expect(parseResult.port.toString()).to.equal('8888');
      expect(parseResult.tag.toString()).to.equal('Foo Bar');
      expect((parseResult as Sip002URI).plugin.toString()).to.equal('obfs-local;obfs=http');
    });

    it('can parse a valid legacy base64 URI', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method.toString()).to.equal('bf-cfb');
      expect(parseResult.password.toString()).to.equal('test');
      expect(parseResult.host.toString()).to.equal('192.168.100.1');
      expect(parseResult.port.toString()).to.equal('8888');
      expect(parseResult.tag.toString()).to.equal('Foo Bar');
    });

    it('throws when parsing empty input', () => {
      expect(() => ShadowsocksURI.parse('')).to.throw(InvalidShadowsocksURI);
    });

    it('throws when parsing invalid input', () => {
      expect(() => ShadowsocksURI.parse('not a URI')).to.throw(InvalidShadowsocksURI);
      expect(() => ShadowsocksURI.parse('ss://not-base64')).to.throw(InvalidShadowsocksURI);
    });
  });
});
