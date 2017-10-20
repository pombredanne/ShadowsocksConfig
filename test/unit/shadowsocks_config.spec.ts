/// <reference types="chai" />
/// <reference types="mocha" />

import { expect } from 'chai';

import {
  Host, Port, Method, Password, Tag, Plugin, Config, makeConfig,
  ShadowsocksURI, Sip002URI, LegacyBase64URI, InvalidConfigField, InvalidURI,
} from '../../shadowsocks_config';

describe('shadowsocks_config', () => {

  describe('Config API', () => {
    it('has expected shape', () => {
      const config = makeConfig({
        host: '192.168.100.1',
        port: 8888,
        method: 'chacha20',
        password: 'P@$$W0RD!',
      });
      const host: string = config.host.data;
      const port: number = config.port.data;
      const method: string = config.method.data;
      const password: string = config.password.data;
      expect(host).to.equal('192.168.100.1');
      expect(port).to.equal(8888);
      expect(method).to.equal('chacha20');
      expect(password).to.equal('P@$$W0RD!');
    });
  });

  describe('field validation', () => {

    it('only accepts hosts that are valid IP addresses', () => {
      for (const valid of ['127.0.0.1', '2001:0:ce49:7601:e866:efff:62c3:fffe']) {
        expect(new Host(valid).data).to.equal(valid);
      }
      expect(() => new Host('localhost').data).to.throw(InvalidConfigField);
      expect(() => new Host('example.com').data).to.throw(InvalidConfigField);
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
      expect(new Port('8388').data).to.equal(8388);
      expect(new Port('443').data).to.equal(443);
      expect(new Port(8388).data).to.equal(8388);
      expect(new Port(443).data).to.equal(443);
    });

    it('throws on empty port', () => {
      expect(() => new Port('')).to.throw(InvalidConfigField);
    });

    it('throws on invalid port', () => {
      expect(() => new Port('foo')).to.throw(InvalidConfigField);
      expect(() => new Port('-123')).to.throw(InvalidConfigField);
      expect(() => new Port('123.4')).to.throw(InvalidConfigField);
      expect(() => new Port('123.4')).to.throw(InvalidConfigField);
      expect(() => new Port(-123)).to.throw(InvalidConfigField);
      expect(() => new Port(123.4)).to.throw(InvalidConfigField);
      // Maximum port number possible is 65535.
      expect(() => new Port(65536)).to.throw(InvalidConfigField);
    });

    it('normalizes non-normalized but valid port', () => {
      expect(new Port('01234').data).to.equal(1234);
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
        expect(new Method(method).data).to.equal(method);
      }
    });

    it('accepts empty password', () => {
      expect(new Password('').data).to.equal('');
    });

    it('accepts empty or undefined tag', () => {
      expect(new Tag('').data).to.equal('');
      expect(new Tag().data).to.equal('');
    });

    it('accepts empty or undefined plugin', () => {
      expect(new Plugin('').data).to.equal('');
      expect(new Plugin().data).to.equal('');
    });

    it('accepts valid plugin', () => {
      expect(new Plugin('obfs-local;obfs=http').data).to.equal('obfs-local;obfs=http');
    });

    it('throws on invalid Sip003 plugin', () => {
      // TODO: Fill this in if plugin validation gets implemented.
    });

    it('throws on Config with missing or invalid fields', () => {
      expect(() => makeConfig({
        host: '192.168.100.1',
        port: '8989',
      })).to.throw(InvalidConfigField);

      expect(() => makeConfig({
        method: 'aes-128-gcm',
        password: 'test',
      })).to.throw(InvalidConfigField);
    });

    it('throw on invalid configs', () => {
      expect(() => makeConfig({
        port: 'foo',
        method: 'aes-128-gcm',
      })).to.throw(InvalidConfigField);

      expect(() => makeConfig({
        port: '1337',
        method: 'foo',
      })).to.throw(InvalidConfigField);
    });
  });

  describe('URI serializer', () => {

    it('can serialize a SIP002 URI', () => {
      const config = makeConfig({
        host: '192.168.100.1',
        port: '8888',
        method: 'aes-128-gcm',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(Sip002URI.stringify(config)).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
    });

    it('can serialize a SIP002 URI with IPv6 host', () => {
      const config = makeConfig({
        host: '2001:0:ce49:7601:e866:efff:62c3:fffe',
        port: '8888',
        method: 'aes-128-gcm',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(Sip002URI.stringify(config)).to.equal(
        'ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888/#Foo%20Bar');
    });

    it('can serialize a legacy base64 URI', () => {
      const config = makeConfig({
        host: '192.168.100.1',
        port: '8888',
        method: 'bf-cfb',
        password: 'test',
        tag: 'Foo Bar',
      });
      expect(LegacyBase64URI.stringify(config)).to.equal(
        'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar');
    });
  });

  describe('URI parser', () => {

    it('exposes a PROTOCOL property with value "ss:"', () => {
      expect(ShadowsocksURI.PROTOCOL).to.equal('ss:');
    });

    it('can parse a valid SIP002 URI with IPv4 host', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
      const config = ShadowsocksURI.parse(input);
      expect(config.method.data).to.equal('aes-128-gcm');
      expect(config.password.data).to.equal('test');
      expect(config.host.data).to.equal('192.168.100.1');
      expect(config.port.data).to.equal(8888);
      expect(config.tag!.data).to.equal('Foo Bar');
    });

    it('can parse a valid SIP002 URI with IPv6 host', () => {
      const input = 'ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888';
      const config = ShadowsocksURI.parse(input);
      expect(config.method.data).to.equal('aes-128-gcm');
      expect(config.password.data).to.equal('test');
      expect(config.host.data).to.equal('2001:0:ce49:7601:e866:efff:62c3:fffe');
      expect(config.port.data).to.equal(8888);
    });

    it('can parse a valid SIP002 URI with a plugin param', () => {
      const input =
        'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp#Foo%20Bar';
      const config = ShadowsocksURI.parse(input);
      expect(config.method.data).to.equal('rc4-md5');
      expect(config.password.data).to.equal('passwd');
      expect(config.host.data).to.equal('192.168.100.1');
      expect(config.port.data).to.equal(8888);
      expect(config.tag!.data).to.equal('Foo Bar');
      expect(config.plugin!.data).to.equal('obfs-local;obfs=http');
    });

    it('can parse a valid legacy base64 URI with IPv4 host', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
      const config = ShadowsocksURI.parse(input);
      expect(config.method.data).to.equal('bf-cfb');
      expect(config.password.data).to.equal('test');
      expect(config.host.data).to.equal('192.168.100.1');
      expect(config.port.data).to.equal(8888);
      expect(config.tag!.data).to.equal('Foo Bar');
    });

    it('can parse a valid legacy base64 URI with IPv6 host', () => {
      const input = 'ss://YmYtY2ZiOnRlc3RAWzIwMDE6MDpjZTQ5Ojc2MDE6ZTg2NjplZmZmOjYyYzM6ZmZmZV06ODg4OA';
      const config = ShadowsocksURI.parse(input);
      expect(config.host.data).to.equal('2001:0:ce49:7601:e866:efff:62c3:fffe');
      expect(config.port.data).to.equal(8888);
      expect(config.method.data).to.equal('bf-cfb');
      expect(config.password.data).to.equal('test');
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
