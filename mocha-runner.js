const mocha = require('mocha');
const expect = require('chai').expect;

//import * as ShadowsocksConfig from 'shadowsocks_config';

const shadowsocks_config = require('./shadowsocks_config');
const {ShadowsocksURI} = shadowsocks_config;

describe('ShadowsocksConfig', () => {
  describe('parser', () => {
    it('can parse valid base64 URIs', () => {
      // example from https://shadowsocks.org/en/config/quick-guide.html#qrcode
      const unparsed = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#example-server';
      const config = ShadowsocksURI.parse(unparsed);
      expect(config.method).to.equal('bf-cfb');
      expect(config.password).to.equal('test');
      expect(config.host).to.equal('192.168.100.1');
      expect(config.port).to.equal(8888);
      expect(config.tag).to.equal('example-server');
    });

    it('can parse valid sip002 URIs', () => {
      expect('nothing').to.be.true;
    });

    it('throws when parsing empty input', () => {
      expect('nothing').to.be.true;
    });

    it('throws when parsing invalid input', () => {
      expect('nothing').to.be.true;
    });
  });
});
