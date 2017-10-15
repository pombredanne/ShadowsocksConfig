interface base64 {
  decode: (input: string) => string;
}

const global = typeof window === 'undefined' ?
  {URL: require('url').URL, base64: {decode: require('base-64').decode}} :
  {URL: (window as any).URL as URL, base64: (window as any).base64 as base64};
const URL = global.URL;
const b64decode = global.base64.decode;

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

export type Host = string;
export type Port = number;
export type Password = string;
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

// Add the method values to the Method object so they can be looked up in it.
for (const key in Method) {
  const value = Method[key];
  Method[value] = value;
}

// ref: https://shadowsocks.org/en/config/quick-guide.html
export class ShadowsocksConfig {
  host: Host;
  port: Port;
  method: Method;
  password: Password;
  tag: Tag;

  constructor(data: {}) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

export abstract class ShadowsocksURI extends ShadowsocksConfig {
  constructor(data: {}) {
    super(data);
  }

  abstract toString(): string;

  static validateProtocol(uri: string) {
    if (!uri.startsWith('ss://')) {
      throw new InvalidShadowsocksURI(`URI must start with "ss://": ${uri}`);
    }
  }

  static validateMethod(method: string) {
    if (!(method in Method)) {
      throw new InvalidShadowsocksURI(`Unrecognized method: ${method}`);
    }
  }

  static validateAndConvertPort(portString: string) {
    const port = Number(portString || 'NaN');
    if (isNaN(port)) {
      throw new InvalidShadowsocksURI('Missing port');
    }
    return port;
  }
}

export class LegacyBase64URI extends ShadowsocksURI {
  private b64EncodedData: string;

  constructor(uri: string) {
    ShadowsocksURI.validateProtocol(uri);
    const hashIndex = uri.indexOf('#');
    let b64EndIndex = hashIndex;
    let tagStartIndex = hashIndex + 1;
    if (hashIndex === -1) {
      b64EndIndex = tagStartIndex = uri.length;
    }
    const tag = decodeURIComponent(uri.substring(tagStartIndex));
    const b64EncodedData = uri.substring('ss://'.length, b64EndIndex);
    const b64DecodedData = b64decode(b64EncodedData);
    const atSignIndex = b64DecodedData.indexOf('@');
    if (atSignIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing "@": ${b64DecodedData}`);
    }
    const methodAndPassword = b64DecodedData.substring(0, atSignIndex);
    const methodEndIndex = methodAndPassword.indexOf(':');
    if (methodEndIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing password part: ${methodAndPassword}`);
    }
    const method = methodAndPassword.substring(0, methodEndIndex);
    ShadowsocksURI.validateMethod(method);
    const passwordStartIndex = methodEndIndex + 1;
    const password = methodAndPassword.substring(passwordStartIndex);
    const hostStartIndex = atSignIndex + 1;
    const hostAndPort = b64DecodedData.substring(hostStartIndex);
    const hostEndIndex = hostAndPort.indexOf(':');
    if (hostEndIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing port part: ${hostAndPort}`);
    }
    const host = hostAndPort.substring(0, hostEndIndex);
    const portStartIndex = hostEndIndex + 1;
    const portString = hostAndPort.substring(portStartIndex);
    const port = ShadowsocksURI.validateAndConvertPort(portString);
    const data = { method, password, host, port, tag };
    super(data);
    this.b64EncodedData = b64EncodedData;
  }

  toString() {
    const { b64EncodedData, tag } = this;
    const hash = tag ? `#${encodeURIComponent(tag)}` : '';
    return `ss://${b64EncodedData}${hash}`;
  }
}

// ref: https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html
export class Sip002URI extends ShadowsocksURI {
  private b64EncodedUserInfo: string;
  // Preserved on a best-effort basis; might get dropped depending on platform support.
  // See: https://caniuse.com/#feat=urlsearchparams
  private plugin_: string;

  constructor(uri: string)  {
    ShadowsocksURI.validateProtocol(uri);
    // replace "ss" with "http" so URL built-in parser parses it correctly.
    const inputForUrlParser = `http${uri.substring(2)}`;
    // The built-in URL parser throws as desired when given URIs with invalid syntax.
    const urlParserResult = new URL(inputForUrlParser);
    // If we got here, the URL parser guarantees hostname is non-empty and syntactically valid.
    const host = urlParserResult.hostname;
    const port = ShadowsocksURI.validateAndConvertPort(urlParserResult.port);
    const tag = decodeURIComponent(urlParserResult.hash.substring(1));
    const b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
    // base64.decode throws as desired when given invalid base64 input.
    const b64DecodedUserInfo = b64decode(b64EncodedUserInfo);
    const colonIdx = b64DecodedUserInfo.indexOf(':');
    if (colonIdx === -1) {
      throw new InvalidShadowsocksURI(`Missing password part: ${b64DecodedUserInfo}`);
    }
    const method = b64DecodedUserInfo.substring(0, colonIdx);
    ShadowsocksURI.validateMethod(method);
    const password = b64DecodedUserInfo.substring(colonIdx + 1);
    const data = { method, password, host, port, tag };
    super(data);
    this.b64EncodedUserInfo = b64EncodedUserInfo;
    this.plugin_ = urlParserResult.searchParams && urlParserResult.searchParams.get('plugin') || '';
  }

  toString() {
    const { b64EncodedUserInfo, host, port, plugin, tag } = this;
    const queryString = plugin ? `?plugin=${plugin}` : '';
    const hash = tag ? `#${encodeURIComponent(tag)}` : '';
    return `ss://${b64EncodedUserInfo}@${host}:${port}/${queryString}${hash}`;
  }

  get plugin() {
    return this.plugin_;
  }
}

export function parseURI(uri: string): ShadowsocksURI {
  let error: Error;
  for (const UriType of [LegacyBase64URI, Sip002URI]) {
    try {
      return new UriType(uri);
    } catch (e) {
      error = error || e;
    }
  }
  if (!(error instanceof InvalidShadowsocksURI)) {
    const errorMessage = (error as {[message: string]: string}).message || '';
    error = new InvalidShadowsocksURI([errorMessage, uri].join(' - '));
  }
  throw error;
}

if (typeof module !== "undefined") {
  module.exports = {
    ShadowsocksConfigError,
    InvalidShadowsocksURI,
    Method,
    ShadowsocksConfig,
    ShadowsocksURI,
    LegacyBase64URI,
    Sip002URI,
    parseURI,
  };
}
