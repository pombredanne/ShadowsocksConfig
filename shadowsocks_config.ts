import * as base64 from 'base-64';
import * as errors from './errors';

// TODO: Narrow any of these types for stricter validation?
type Host = string;
type Port = number;
type Password = string;
type Timeout = number;
type Tag = string;

// list of cipher method values: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
enum Method {
  RC4_MD5 = 'rc4-md5',
  AES_128_GCM = 'aes-128-gcm',
  AES_192_GCM = 'aes-192-gcm',
  AES_256_GCM = 'aes-256-gcm',
  AES_128_CFB = 'aes-128-cfb',
  AES_192_CFB = 'aes-192-cfb',
  AES_256_CFB = 'aes-256-cfb',
  AES_128_CTR = 'aes-128-ctr',
  AES_192_CTR = 'aes-192-ctr',
  AES_256_CTR = 'aes-256-ctr',
  CAMELLIA_128_CFB = 'camellia-128-cfb',
  CAMELLIA_192_CFB = 'camellia-192-cfb',
  CAMELLIA_256_CFB = 'camellia-256-cfb',
  BF_CFB = 'bf-cfb',
  CHACHA20-IETF-POLY1305 = 'chacha20-ietf-poly1305',
  SALSA20 = 'salsa20',
  CHACHA20 = 'chacha20',
  CHACHA20_IETF = 'chacha20-ietf',
}

// ref: https://shadowsocks.org/en/config/quick-guide.html
export interface Config {
  method?: Method;
  host?: Host;
  port?: Port;
  password?: Password;
  timeout?: Timeout;
  tag?: Tag;
}

export class ShadowsocksURI implements Config {
  private type: Base64URI | Sip002URI;
  private parsed: Config;

  constructor(private unparsed: string) {
    this.type = new.target;
    const config = this.type.parse(unparsed);
    for (const key in config) {
      this[key] = config[key];
    }
  }

  /* TODO
  get method() {
    const url = new
  }
   */

  static parse(unparsed: string) : Config {
    throw new errors.AbstractMethodNotImplemented();
  }

  toString() {
    throw new errors.AbstractMethodNotImplemented();
  }

  static guessURIType(unparsed: string) {
    return unparsed.includes('@') ? Sip002URI : Base64URI;
  }
}

class Base64URI extends ShadowsocksURI {
  constructor(unparsed: string) {
    super(unparsed);
    if (!unparsed.startsWith('ss://')) throw new errors.InvalidShadowsocksURI(unparsed);
    unparsed = unparsed.substring(5);
    // ...
  }

  toString() {
    // ...
  }
}

class Sip002URI extends ShadowsocksURI {
  constructor(unparsed: string) {
    super(unparsed);
  }

  static parse(unparsed: string) : Config {

  }

  toString() {
    // ...
  }
}
