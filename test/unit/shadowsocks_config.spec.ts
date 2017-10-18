/// <reference types="chai" />
/// <reference types="mocha" />

import { expect } from 'chai';

import {
  Host, Port, Method, Password, Tag,
  Config, ShadowsocksURI, Sip002URI, LegacyBase64URI,
  Plugin, InvalidConfigField, InvalidURI,
} from '../../shadowsocks_config';

describe('shadowsocks_config', () => {

  describe('field validation', () => {

    it('only accepts hosts that are valid IP addresses', () => {
      for (const valid of ['127.0.0.1', '2001:0:ce49:7601:e866:efff:62c3:fffe']) {
        expect(new Host(valid).toString()).to.equal(valid);
      }
      expect(() => new Host('localhost').toString()).to.throw(InvalidConfigField);
      expect(() => new Host('example.com').toString()).to.throw(InvalidConfigField);
      expect(() => new Host('-')).to.throw(InvalidConfigField);
      expect(() => new Host('.')).to.throw(InvalidConfigField);
      expect(() => new Host('....')).to.throw(InvalidConfigField);
      expect(() => new Host('8675309')).to.throw(InvalidConfigField);
      expect(() => new Host('-foo')).to.throw(InvalidConfigField);
    });

    it('throws on empty host', () => {
      expect(() => new Host('')).to.throw(InvalidConfigField);
    });

    it('accepts valid ports', () => {
      expect(new Port('8388').toString()).to.equal('8388');
      expect(new Port('443').toString()).to.equal('443');
    });

    it('throws on empty port', () => {
      expect(() => new Port('')).to.throw(InvalidConfigField);
    });

    it('throws on invalid port', () => {
      expect(() => new Port('foo')).to.throw(InvalidConfigField);
      expect(() => new Port('-123')).to.throw(InvalidConfigField);
      expect(() => new Port('123.4')).to.throw(InvalidConfigField);
    });

    it('normalizes non-normalized but valid port', () => {
      expect(new Port('01234').toString()).to.equal('1234');
    });

    it('throws on empty method', () => {
      expect(() => new Method('')).to.throw(InvalidConfigField);
    });

    it('throws on invalid method', () => {
      expect(() => new Method('foo')).to.throw(InvalidConfigField);
    });

    it('accepts valid methods', () => {
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
        expect(new Method(method).toString()).to.equal(method);
      }
    });

    it('accepts empty or undefined password', () => {
      expect(new Password('').toString()).to.equal('');
      expect(new Password().toString()).to.equal('');
    });

    it('accepts empty or undefined tag', () => {
      expect(new Tag('').toString()).to.equal('');
      expect(new Tag().toString()).to.equal('');
    });

    it('accepts empty or undefined plugin', () => {
      expect(new Plugin('').toString()).to.equal('');
      expect(new Plugin().toString()).to.equal('');
    });

    it('accepts valid plugin', () => {
      expect(new Plugin('obfs-local;obfs=http').toString()).to.equal('obfs-local;obfs=http');
    });

    it('throws on invalid Sip003 plugin', () => {
      // TODO: Fill this in if plugin validation gets implemented.
    });

    it('throws on Config with missing or invalid fields', () => {
      expect(() => new Config({
        host: '192.168.100.1',
        port: '8989',
      })).to.throw(InvalidConfigField);

      expect(() => new Config({
        method: 'aes-128-gcm',
        password: 'test',
      })).to.throw(InvalidConfigField);
    });

    it('throw on invalid configs', () => {
      expect(() => new Config({
        port: 'foo',
        method: 'aes-128-gcm',
      })).to.throw(InvalidConfigField);

      expect(() => new Config({
        port: '1337',
        method: 'foo',
      })).to.throw(InvalidConfigField);
    });
  });

  describe('URI serializer', () => {

    it('can serialize a SIP002 URI', () => {
      const config = new Config({
        host: '192.168.100.1',
        port: '8888',
        method: 'aes-128-gcm',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(new Sip002URI(config).toString()).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
    });

    it('can serialize a SIP002 URI with IPv6 host', () => {
      const config = new Config({
        host: '2001:0:ce49:7601:e866:efff:62c3:fffe',
        port: '8888',
        method: 'aes-128-gcm',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(new Sip002URI(config).toString()).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888/#Foo%20Bar');
    });

    it('can serialize a legacy base64 URI', () => {
      const config = new Config({
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

    it('can parse a valid SIP002 URI with IPv4 host', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('aes-128-gcm');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.tag).to.equal('Foo Bar');
    });

    it('can parse a valid SIP002 URI with IPv6 host', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('aes-128-gcm');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('2001:0:ce49:7601:e866:efff:62c3:fffe');
      expect(parseResult.port).to.equal('8888');
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

    it('can parse a valid legacy base64 URI with IPv4 host', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.method).to.equal('bf-cfb');
      expect(parseResult.password).to.equal('test');
      expect(parseResult.host).to.equal('192.168.100.1');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.tag).to.equal('Foo Bar');
    });

    it('can parse a valid legacy base64 URI with IPv6 host', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAWzIwMDE6MDpjZTQ5Ojc2MDE6ZTg2NjplZmZmOjYyYzM6ZmZmZV06ODg4OA';
      const parseResult = ShadowsocksURI.parse(input);
      expect(parseResult.host).to.equal('2001:0:ce49:7601:e866:efff:62c3:fffe');
      expect(parseResult.port).to.equal('8888');
      expect(parseResult.method).to.equal('bf-cfb');
      expect(parseResult.password).to.equal('test');
    });

    it('throws when parsing empty input', () => {
      expect(() => ShadowsocksURI.parse('')).to.throw(InvalidURI);
    });

    it('throws when parsing invalid input', () => {
      expect(() => ShadowsocksURI.parse('not a URI')).to.throw(InvalidURI);
      expect(() => ShadowsocksURI.parse('ss://not-base64')).to.throw(InvalidURI);
    });
  });
});
