/// <reference types="base-64" />
/// <reference types="node" />
import * as base64 from 'base-64';
import * as errors from './errors';

// TODO: Narrow any of these types for stricter validation?
export type Host = string;
export type Port = number;
export type Password = string;
export type Timeout = number;
export type Tag = string;

// list of cipher method values: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
export enum Method {
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
  'CHACHA20-IETF-POLY1305' = 'chacha20-ietf-poly1305',
  SALSA20 = 'salsa20',
  CHACHA20 = 'chacha20',
  CHACHA20_IETF = 'chacha20-ietf',
}

export class ShadowsocksConfigError extends Error {
  constructor(message?: string) {
    // ref: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    super(message);  // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype);  // restore prototype chain
    this.name = new.target.name;
  }
}

export class InvalidShadowsocksURI extends ShadowsocksConfigError {
  constructor(public readonly message: string) {
    super(message);
  }
}

// ref: https://shadowsocks.org/en/config/quick-guide.html
export class ShadowSocksURI {

  method: Method;
  host: Host;
  port: Port;
  password: Password;
  timeout: Timeout;
  tag: Tag;

  constructor(data: {}, private type: URIType) {
    this.type = type;
    for (const key in data) {
      this[key] = data[key];
    }
  }

  toString(): string {
    return this.type.toString(this);
  }

}

export interface URIType {
  parse(urlString: string): ShadowSocksURI;
  toString(data: ShadowSocksURI): string;
  isValid(urlString: string)
}

class Base64URI {
  static parse(urlString: string): ShadowSocksURI  {
    const data = {};
    return new ShadowSocksURI(data, Base64URI);
  }

  static toString(data: ShadowSocksURI): string {
    return "ss://";
  }

  static isValid(urlString: string): boolean {
    return !urlString.includes('@');
  }

}

class Sip002URI {
  static parse(urlString: string): ShadowSocksURI  {
    const data = {};
    return new ShadowSocksURI(data, Sip002URI);
  }

  static toString(data: ShadowSocksURI): string {
    return "ss://base64";
  }

  static isValid(urlString: string): boolean {
    return urlString.includes('@');
  }
}

export function parseURI(input: string): ShadowSocksURI {
  if (Base64URI.isValid(input)) {
    return Base64URI.parse(input);
  } else if (Sip002URI.isValid(input)) {
    return Sip002URI.parse(input);
  }
  throw new Error('Invalid URL');
}

if (typeof module !== "undefined") {
  module.exports = {
    ShadowSocksURI,
    Base64URI,
    Sip002URI,
    parseURI
  };
}
