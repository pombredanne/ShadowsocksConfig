/// <reference types="chai" />
/// <reference types="mocha" />

import { expect } from 'chai';
import { InvalidShadowsocksURI, Sip002URI, parseURI } from '../../ShadowsocksConfig';

describe('ShadowsocksConfig', () => {
  describe('ShadowsocksURI parser', () => {

    it('can parse a valid SIP002 URI with no plugin param', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
      const parseResult = parseURI(input);
      expect(parseResult.method).to.equal('aes-128-gcm');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal(8888);
      expect(parseResult.tag).to.equal('Foo Bar');
    });

    it('can parse a valid SIP002 URI with a plugin param', () => {
      const input =
        'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp#Foo%20Bar';
      const parseResult = parseURI(input);
      expect(parseResult.method).to.equal('rc4-md5');
      expect(parseResult.password).to.equal('passwd');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal(8888);
      expect(parseResult.tag).to.equal('Foo Bar');
      expect((parseResult as Sip002URI).plugin).to.equal('obfs-local;obfs=http');
    });

    
    it('can parse valid legacy base64 URIs', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
      const parseResult = parseURI(input);
      expect(parseResult.method).to.equal('bf-cfb');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal(8888);
      expect(parseResult.tag).to.equal('Foo Bar');
    });

    it('throws when parsing empty input', () => {
      expect(() => parseURI('')).to.throw(InvalidShadowsocksURI);
    });

    it('throws when parsing invalid input', () => {
      expect(() => parseURI('not a URI')).to.throw(InvalidShadowsocksURI);
      expect(() => parseURI('ss://not-base64')).to.throw(InvalidShadowsocksURI);
    });
  });
});
