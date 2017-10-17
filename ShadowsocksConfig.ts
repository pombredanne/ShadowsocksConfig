import { decode as b64Decode, encode as b64Encode } from 'base-64';

// Node compatibility - allows running mocha tests:
try { URL; } catch (_) { (global as any).URL = require('url').URL; }

// Custom errors
export class ShadowsocksConfigError extends Error {
  constructor(message: string) {
    super(message);  // 'Error' breaks prototype chain here if this is transpiled to es5
    Object.setPrototypeOf(this, new.target.prototype);  // restore prototype chain
    this.name = new.target.name;
  }
}

export class InvalidShadowsocksURI extends ShadowsocksConfigError {
  constructor(public readonly message: string) {
    super(message);
  }
}
// End custom errors


// Self-validating/normalizing config data types subclass this ConfigData class.
// Constructors take a string, validate/normalize/accept if valid, or throw otherwise.
// Some examples (Port is a ConfigData subclass, see below):
//   new Port('')           -> throws
//   new Port('not a port') -> throws
//   new Port('-123')       -> throws
//   new Port('123.4')      -> throws
//   new Port('01234')      -> '1234'
export class ConfigData {
  constructor(public readonly data: string) {}

  toString() {
    return this.data.toString();
  }
}

function throwErrorForInvalidField(fieldName: string, fieldValue: string) {
  throw new ShadowsocksConfigError(`Invalid ${fieldName}: ${fieldValue}`);
}

// Host and Port validation/normalization are built on top of URL for safety and efficiency.
export class Host extends ConfigData {
  constructor(data: string) {
    try {
      const urlParserResult = new URL(`http://${data}/`);
      super(urlParserResult.hostname);
    } catch (_) {
      throwErrorForInvalidField('host', data);
    }
  }
}

// NOTE: Port data is stored as a string, not a number, as in a URL instance.
export class Port extends ConfigData {
  constructor(data: string) {
    const throwError = () => throwErrorForInvalidField('port', data);
    if (!data) throwError();
    try {
      const urlParserResult = new URL(`http://0.0.0.0:${data}/`);
      super(urlParserResult.port);
    } catch (_) {
      throwError();
    }
  }
}

// A method value must exactly match an element in the set of known ciphers.
// ref: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
export class Method extends ConfigData {
  private static METHODS = new Set([
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
    'chacha20-ietf'
   ]);

  constructor(data: string) {
    if (!Method.METHODS.has(data)) {
      throwErrorForInvalidField('method', data);
    }
    super(data);
  }
}

// Currently no validation is performed for Password, Tag, or Sip003Plugin.
// Client code is responsible for validating and sanitizing these when using with untrusted input.
export class Password extends ConfigData {
  constructor(data: string) {
    super(data);
  }
}

export class Tag extends ConfigData {
  constructor(data: string) {
    super(data);
  }
}

export class Sip003Plugin extends ConfigData {
  constructor(data: string) {
    super(data);
  }
}

export class ShadowsocksConfig {
  host?: Host;
  port?: Port;
  method?: Method;
  password?: Password;
  tag?: Tag;

  constructor(config: ShadowsocksConfig) {
    this.host = config.host;
    this.port = config.port;
    this.method = config.method;
    this.password = config.password;
    this.tag = config.tag;
  }
}

export abstract class ShadowsocksURI extends ShadowsocksConfig {
  constructor(config: ShadowsocksConfig) {
    super(config);
  }

  abstract toString(): string;

  static validateProtocol(uri: string) {
    if (!uri.startsWith('ss://')) {
      throw new InvalidShadowsocksURI(`URI must start with "ss://": ${uri}`);
    }
  }

  static getHash(config: ShadowsocksConfig) {
    return config.tag ? `#${encodeURIComponent(config.tag.toString())}` : '';
  }

  static parse(uri: string): ShadowsocksConfig {
    let error: Error;
    for (const UriType of [LegacyBase64URI, Sip002URI]) {
      try {
        return UriType.parse(uri);
      } catch (e) {
        error = error || e;
      }
    }
    if (!(error instanceof InvalidShadowsocksURI)) {
      const originalErrorName = (error as Error).name || '(Unnamed Error)';
      const originalErrorMessage = (error as Error).message || '(no error message provided)';
      const originalErrorString = `${originalErrorName}: ${originalErrorMessage}`;
      const newErrorMessage = `Invalid input: ${uri} - Original error: ${originalErrorString}`;
      error = new InvalidShadowsocksURI(newErrorMessage);
    }
    throw error;
  }
}

// Ref: https://shadowsocks.org/en/config/quick-guide.html
export class LegacyBase64URI extends ShadowsocksURI {
  b64EncodedData: string;

  constructor(config: ShadowsocksConfig) {
    super(config);
    const { method, password, host, port } = this;
    const b64EncodedData = b64Encode(`${method}:${password}@${host}:${port}`);
    const dataLength = b64EncodedData.length;
    let paddingLength = 0;
    for (; b64EncodedData[dataLength - 1 - paddingLength] === '='; paddingLength++);
    this.b64EncodedData = paddingLength === 0 ? b64EncodedData :
        b64EncodedData.substring(0, dataLength - paddingLength);
  }

  static parse(uri: string) {
    ShadowsocksURI.validateProtocol(uri);
    const hashIndex = uri.indexOf('#');
    let b64EndIndex = hashIndex;
    let tagStartIndex = hashIndex + 1;
    if (hashIndex === -1) {
      b64EndIndex = tagStartIndex = uri.length;
    }
    const tag = new Tag(decodeURIComponent(uri.substring(tagStartIndex)));
    const b64EncodedData = uri.substring('ss://'.length, b64EndIndex);
    const b64DecodedData = b64Decode(b64EncodedData);
    const atSignIndex = b64DecodedData.indexOf('@');
    if (atSignIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing "@": ${b64DecodedData}`);
    }
    const methodAndPassword = b64DecodedData.substring(0, atSignIndex);
    const methodEndIndex = methodAndPassword.indexOf(':');
    if (methodEndIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing password part: ${methodAndPassword}`);
    }
    const methodString = methodAndPassword.substring(0, methodEndIndex);
    const method = new Method(methodString);
    const passwordStartIndex = methodEndIndex + 1;
    const passwordString = methodAndPassword.substring(passwordStartIndex);
    const password = new Password(passwordString);
    const hostStartIndex = atSignIndex + 1;
    const hostAndPort = b64DecodedData.substring(hostStartIndex);
    const hostEndIndex = hostAndPort.indexOf(':');
    if (hostEndIndex === -1) {
      throw new InvalidShadowsocksURI(`Missing port part: ${hostAndPort}`);
    }
    const host = new Host(hostAndPort.substring(0, hostEndIndex));
    const portStartIndex = hostEndIndex + 1;
    const portString = hostAndPort.substring(portStartIndex);
    const port = new Port(portString);
    return new LegacyBase64URI({ method, password, host, port, tag });
  }

  toString() {
    const { b64EncodedData, tag } = this;
    const hash = ShadowsocksURI.getHash(this);
    return `ss://${b64EncodedData}${hash}`;
  }
}

// Ref: https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html
// NOTE: Currently the plugin query param is preserved on a best-effort basis. It is silently
//       dropped on platforms that do not support the full whatwg URL standard (cf. `searchParams`).
//       Ref:
//         - https://url.spec.whatwg.org/#url-class
//         - https://caniuse.com/#feat=urlsearchparams
export class Sip002URI extends ShadowsocksURI {
  b64EncodedUserInfo: string;
  plugin?: Sip003Plugin;

  constructor(config: ShadowsocksConfig) {
    super(config);
    const { method, password } = this;
    this.b64EncodedUserInfo = b64Encode(`${method}:${password}`);
    const plugin = (config as Sip002URI).plugin;
    if (plugin) {
      this.plugin = plugin as Sip003Plugin;
    }
  }

  static parse(uri: string) {
    ShadowsocksURI.validateProtocol(uri);
    // replace "ss" with "http" so URL built-in parser parses it correctly.
    const inputForUrlParser = `http${uri.substring(2)}`;
    // The built-in URL parser throws as desired when given URIs with invalid syntax.
    const urlParserResult = new URL(inputForUrlParser);
    const host = new Host(urlParserResult.hostname);
    const port = new Port(urlParserResult.port);
    const tag = new Tag(decodeURIComponent(urlParserResult.hash.substring(1)));
    const b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
    // base64.decode throws as desired when given invalid base64 input.
    const b64DecodedUserInfo = b64Decode(b64EncodedUserInfo);
    const colonIdx = b64DecodedUserInfo.indexOf(':');
    if (colonIdx === -1) {
      throw new InvalidShadowsocksURI(`Missing password part: ${b64DecodedUserInfo}`);
    }
    const methodString = b64DecodedUserInfo.substring(0, colonIdx);
    const method = new Method(methodString);
    const passwordString = b64DecodedUserInfo.substring(colonIdx + 1);
    const password = new Password(passwordString);
    let plugin: Sip003Plugin;
    if (urlParserResult.searchParams) {
      const pluginString = urlParserResult.searchParams.get('plugin');
      plugin = pluginString ? new Sip003Plugin(pluginString) : undefined;
    }
    return new Sip002URI({ method, password, host, port, tag, plugin } as Sip002URI);
  }

  toString() {
    const { b64EncodedUserInfo, host, port, plugin, tag } = this;
    const queryString = plugin ? `?plugin=${plugin}` : '';
    const hash = ShadowsocksURI.getHash(this);
    return `ss://${b64EncodedUserInfo}@${host}:${port}/${queryString}${hash}`;
  }
}
