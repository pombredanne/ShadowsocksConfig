/// <reference types="chai" />
/// <reference types="mocha" />

import { expect } from 'chai';

import {
  Host, Port, Method, Password, Tag,
  ValidatingShadowsocksConfig, ShadowsocksURI, Sip002URI, LegacyBase64URI,
  Plugin, ShadowsocksConfigError, InvalidShadowsocksURI,
} from '../../ShadowsocksConfig';

describe('ShadowsocksConfig', () => {

  describe('validators', () => {

    it('accept valid hosts', () => {
      expect(new Host('localhost').toString()).to.equal('localhost');
      expect(new Host('127.0.0.1').toString()).to.equal('127.0.0.1');
      expect(new Host('example.com').toString()).to.equal('example.com');
    });

    it('throw on empty host', () => {
      expect(() => new Host('')).to.throw(ShadowsocksConfigError);
    });

    it('accept valid ports', () => {
      expect(new Port('8388').toString()).to.equal('8388');
      expect(new Port('443').toString()).to.equal('443');
    });

    // TODO: These tests currently fail because the URL builtin accepts these
    // host values. Do we want to get into the business of validating hosts
    // ourselves?
    /*
    it('throw on invalid host', () => {
      expect(() => new Host('-')).to.throw(ShadowsocksConfigError);
      expect(() => new Host('.')).to.throw(ShadowsocksConfigError);
      expect(() => new Host('....')).to.throw(ShadowsocksConfigError);
      expect(() => new Host('8675309')).to.throw(ShadowsocksConfigError);
      expect(() => new Host('-foo')).to.throw(ShadowsocksConfigError);
    });
    */

    it('throw on empty port', () => {
      expect(() => new Port('')).to.throw(ShadowsocksConfigError);
    });

    it('throw on invalid port', () => {
      expect(() => new Port('foo')).to.throw(ShadowsocksConfigError);
      expect(() => new Port('-123')).to.throw(ShadowsocksConfigError);
      expect(() => new Port('123.4')).to.throw(ShadowsocksConfigError);
    });

    it('normalizes non-normalized but valid port', () => {
      expect(new Port('01234').toString()).to.equal('1234');
    });

    it('throw on empty method', () => {
      expect(() => new Method('')).to.throw(ShadowsocksConfigError);
    });

    it('throw on invalid method', () => {
      expect(() => new Method('foo')).to.throw(ShadowsocksConfigError);
    });

    it('accept valid methods', () => {
      for (const method of [
        'rc4-md5',
        'aes-128-gcm',
        'aes-192-gcm',
        'aes-256-gcm',
        'aes-128-cfb',
        'aes-192-cfb',
        'aes-256-cfb',
        'aes-128-ctr',
        'aes-192-ctr',
        'aes-256-ctr',
        'camellia-128-cfb',
        'camellia-192-cfb',
        'camellia-256-cfb',
        'bf-cfb',
        'chacha20-ietf-poly1305',
        'salsa20',
        'chacha20',
        'chacha20-ietf',
      ]) {
        expect(() => new Method(method)).to.not.throw();
      }
    });

    it('accept empty password', () => {
      expect(() => new Password('')).to.not.throw();
    });

    it('accept empty tag', () => {
      expect(() => new Tag('')).to.not.throw();
    });

    it('accept valid Sip003 plugin', () => {
      expect(new Plugin('obfs-local;obfs=http').toString()).to.equal('obfs-local;obfs=http');
    });

    it('throw on invalid Sip003 plugin', () => {
      // TODO: Fill this in if plugin validation gets implemented.
    });

    it('allow configs with missing fields', () => {
      expect(() => new ValidatingShadowsocksConfig({
        host: '192.168.100.1',
        port: '8989',
      })).to.not.throw();

      expect(() => new ValidatingShadowsocksConfig({
        method: 'aes-128-gcm',
        password: 'test',
      })).to.not.throw();
    });

    it('throw on invalid configs', () => {
      expect(() => new ValidatingShadowsocksConfig({
        port: 'foo',
        method: 'aes-128-gcm',
      })).to.throw(ShadowsocksConfigError);

      expect(() => new ValidatingShadowsocksConfig({
        port: '1337',
        method: 'foo',
      })).to.throw(ShadowsocksConfigError);
    });
  });

  describe('URI serializer', () => {

    it('can serialize a SIP002 URI', () => {
      const config = new ValidatingShadowsocksConfig({
        host: '192.168.100.1',
        port: '8888',
        method: 'aes-128-gcm',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(new Sip002URI(config).toString()).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
    });

    it('can serialize a legacy base64 URI', () => {
      const config = new ValidatingShadowsocksConfig({
        host: '192.168.100.1',
        port: '8888',
        method: 'bf-cfb',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(new LegacyBase64URI(config).toString()).to.equal(
        'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar');
    });
  });

  describe('URI parser', () => {

    it('can parse a valid SIP002 URI with no plugin param', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('aes-128-gcm');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.tag).to.equal('Foo Bar');
    });

    it('can parse a valid SIP002 URI with a plugin param', () => {
      const input =
        'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('rc4-md5');
      expect(parseResult.password).to.equal('passwd');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.tag).to.equal('Foo Bar');
      expect((parseResult as Sip002URI).plugin).to.equal('obfs-local;obfs=http');
    });

    it('can parse a valid legacy base64 URI', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('bf-cfb');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.tag).to.equal('Foo Bar');
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
