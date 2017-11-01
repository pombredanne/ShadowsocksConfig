/// <reference types="node" />
/// <reference path="./punycode.d.ts" />

const isBrowser = typeof window !== 'undefined';
const b64Encode = isBrowser ? btoa : require('base-64').encode;
const b64Decode = isBrowser ? atob : require('base-64').decode;
const URL = isBrowser ? window.URL : require('url').URL;
const punycode = isBrowser ? (window as any).punycode : require('punycode');

// Custom error base class
export class ShadowsocksConfigError extends Error {
  constructor(message: string) {
    super(message);  // 'Error' breaks prototype chain here if this is transpiled to es5
    Object.setPrototypeOf(this, new.target.prototype);  // restore prototype chain
    this.name = new.target.name;
  }
}

export class InvalidConfigField extends ShadowsocksConfigError {}

export class InvalidUri extends ShadowsocksConfigError {}

// Self-validating/normalizing config data types implement this ValidatedConfigField interface.
// Constructors take some data, validate, normalize, and store if valid, or throw otherwise.
export abstract class ValidatedConfigField {};

function throwErrorForInvalidField(name: string, value: any, reason?: string) {
  throw new InvalidConfigField(`Invalid ${name}: ${value} ${reason || ''}`);
}

export class Host extends ValidatedConfigField {
  public static IPV4_PATTERN = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  public static IPV6_PATTERN = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
  public static HOSTNAME_PATTERN = /^[A-z0-9]+[A-z0-9_.-]*$/;
  public readonly data: string;
  public readonly isIPv4: boolean;
  public readonly isIPv6: boolean;
  public readonly isHostname: boolean;

  constructor(host: Host | string) {
    super();
    if (!host) {
      throwErrorForInvalidField('host', host);
    }
    if (host instanceof Host) {
      host = host.data;
    }
    host = punycode.toASCII(host) as string;
    this.isIPv4 = Host.IPV4_PATTERN.test(host);
    this.isIPv6 = this.isIPv4 ? false : Host.IPV6_PATTERN.test(host);
    this.isHostname = this.isIPv4 || this.isIPv6 ? false : Host.HOSTNAME_PATTERN.test(host);
    if (!(this.isIPv4 || this.isIPv6 || this.isHostname)) {
      throwErrorForInvalidField('host', host);
    }
    this.data = host;
  }
}

export class Port extends ValidatedConfigField {
  public static readonly PATTERN = /^[0-9]{1,5}$/;
  public readonly data: number;

  constructor(port: Port | string | number) {
    super();
    if (port instanceof Port) {
      port = port.data;
    }
    if (typeof port === 'number') {
      // Stringify in case negative or floating point -> the regex test below will catch.
      port = port.toString();
    }
    if (!Port.PATTERN.test(port)) {
      throwErrorForInvalidField('port', port);
    }
    // Could exceed the maximum port number, so convert to Number to check. Could also have leading
    // zeros. Converting to Number drops those, so we get normalization for free. :)
    port = Number(port);
    if (port > 65535) {
      throwErrorForInvalidField('port', port);
    }
    this.data = port;
  }
}

// A method value must exactly match an element in the set of known ciphers.
// ref: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
export const METHODS = new Set([
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
]);

export class Method extends ValidatedConfigField {
  public readonly data: string;
  constructor(method: Method | string) {
    super();
    if (method instanceof Method) {
      method = method.data;
    }
    if (!METHODS.has(method)) {
      throwErrorForInvalidField('method', method);
    }
    this.data = method;
  }
}

// Currently no sanitization is performed for Password, Tag, or Plugin. Client code is responsible
// for sanitizing these values when received from untrusted input.
// TODO: Document this in the README.
export class Password extends ValidatedConfigField {
  public readonly data: string;

  constructor(password: Password | string) {
    super();
    this.data = password instanceof Password ? password.data : password;
  }
}

export class Tag extends ValidatedConfigField {
  public readonly data: string;

  constructor(tag: Tag | string = '') {
    super();
    this.data = tag instanceof Tag ? tag.data : tag;
  }
}

export class Plugin extends ValidatedConfigField {
  public readonly data: string;

  constructor(plugin: Plugin | string = '') {
    super();
    this.data = plugin instanceof Plugin ? plugin.data : plugin;
  }
}

export interface Config {
  host: Host;
  port: Port;
  method: Method;
  password: Password;
  tag?: Tag;
  plugin?: Plugin;
}

export function makeConfig(config: {[key: string]: any}): Config {
  // Use "!" for the required fields to tell tsc that we handle undefined in the
  // ValidatedConfigFields we call; tsc can't figure that out otherwise.
  return {
    host: new Host(config.host!),
    port: new Port(config.port!),
    method: new Method(config.method!),
    password: new Password(config.password!),
    tag: new Tag(config.tag),
    plugin: new Plugin(config.plugin),
  };
}


export const ShadowsocksUri = {
  PROTOCOL: 'ss:',

  getUriFormattedHost: (host: Host) => {
    return host.isIPv6 ? `[${host.data}]` : host.data;
  },

  getHash: (tag?: Tag) => {
    return tag ? `#${encodeURIComponent(tag.data)}` : '';
  },

  validateProtocol: (uri: string) => {
    if (!uri.startsWith(ShadowsocksUri.PROTOCOL)) {
      throw new InvalidUri(`URI must start with "${ShadowsocksUri.PROTOCOL}": ${uri}`);
    }
  },

  parse: (uri: string): Config => {
    let error: Error | undefined;
    for (const UriType of [LegacyBase64Uri, Sip002Uri]) {
      try {
        return UriType.parse(uri);
      } catch (e) {
        error = error || e;
      }
    }
    if (!(error instanceof InvalidUri)) {
      const originalErrorName = error!.name! || '(Unnamed Error)';
      const originalErrorMessage = error!.message! || '(no error message provided)';
      const originalErrorString = `${originalErrorName}: ${originalErrorMessage}`;
      const newErrorMessage = `Invalid input: ${uri} - Original error: ${originalErrorString}`;
      error = new InvalidUri(newErrorMessage);
    }
    throw error;
  },
};

// Ref: https://shadowsocks.org/en/config/quick-guide.html
export const LegacyBase64Uri = {
  parse: (uri: string): Config => {
    ShadowsocksUri.validateProtocol(uri);
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
      throw new InvalidUri(`Missing "@": ${b64DecodedData}`);
    }
    const methodAndPassword = b64DecodedData.substring(0, atSignIndex);
    const methodEndIndex = methodAndPassword.indexOf(':');
    if (methodEndIndex === -1) {
      throw new InvalidUri(`Missing password part: ${methodAndPassword}`);
    }
    const methodString = methodAndPassword.substring(0, methodEndIndex);
    const method = new Method(methodString);
    const passwordStartIndex = methodEndIndex + 1;
    const passwordString = methodAndPassword.substring(passwordStartIndex);
    const password = new Password(passwordString);
    const hostStartIndex = atSignIndex + 1;
    const hostAndPort = b64DecodedData.substring(hostStartIndex);
    const hostEndIndex = hostAndPort.lastIndexOf(':');
    if (hostEndIndex === -1) {
      throw new InvalidUri(`Missing port part: ${hostAndPort}`);
    }
    const uriFormattedHost = hostAndPort.substring(0, hostEndIndex);
    let host: Host;
    try {
      host = new Host(uriFormattedHost);
    } catch (_) {
      // Could be IPv6 host formatted with surrounding brackets, so try stripping first and last
      // characters. If this throws, give up and let the exception propagate.
      host = new Host(uriFormattedHost.substring(1, uriFormattedHost.length - 1));
    }
    const portStartIndex = hostEndIndex + 1;
    const portString = hostAndPort.substring(portStartIndex);
    const port = new Port(portString);
    return {method, password, host, port, tag};
  },

  stringify: (config: Config) => {
    const {method, password, host, port} = config;
    const hash = ShadowsocksUri.getHash(config.tag);
    let b64EncodedData = b64Encode(`${method.data}:${password.data}@${host.data}:${port.data}`);
    const dataLength = b64EncodedData.length;
    let paddingLength = 0;
    for (; b64EncodedData[dataLength - 1 - paddingLength] === '='; paddingLength++);
    b64EncodedData = paddingLength === 0 ? b64EncodedData :
        b64EncodedData.substring(0, dataLength - paddingLength);
    return `ss://${b64EncodedData}${hash}`;
  },
};

// Ref: https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html
// NOTE: Currently the plugin query param is preserved on a best-effort basis. It is silently
//       dropped on platforms that do not support the full whatwg URL standard (cf. `searchParams`).
//       Ref:
//         - https://url.spec.whatwg.org/#url-class
//         - https://caniuse.com/#feat=urlsearchparams
export const Sip002Uri = {
  parse: (uri: string): Config => {
    ShadowsocksUri.validateProtocol(uri);
    // Can use built-in URL parser for expedience. Just have to replace "ss" with "http" to ensure
    // correct results.
    const inputForUrlParser = `http${uri.substring(2)}`;
    // The built-in URL parser throws as desired when given URIs with invalid syntax.
    const urlParserResult = new URL(inputForUrlParser);
    const uriFormattedHost = urlParserResult.hostname;
    // URI-formatted IPv6 hostnames have surrounding brackets.
    const last = uriFormattedHost.length - 1;
    const brackets = uriFormattedHost[0] === '[' && uriFormattedHost[last] === ']';
    const hostString = brackets ? uriFormattedHost.substring(1, last) : uriFormattedHost;
    const host = new Host(hostString);
    const port = new Port(urlParserResult.port);
    const tag = new Tag(decodeURIComponent(urlParserResult.hash.substring(1)));
    const b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
    // base64.decode throws as desired when given invalid base64 input.
    const b64DecodedUserInfo = b64Decode(b64EncodedUserInfo);
    const colonIdx = b64DecodedUserInfo.indexOf(':');
    if (colonIdx === -1) {
      throw new InvalidUri(`Missing password part: ${b64DecodedUserInfo}`);
    }
    const methodString = b64DecodedUserInfo.substring(0, colonIdx);
    const method = new Method(methodString);
    const passwordString = b64DecodedUserInfo.substring(colonIdx + 1);
    const password = new Password(passwordString);
    let plugin: Plugin | undefined;
    if (urlParserResult.searchParams) {
      const pluginString = urlParserResult.searchParams.get('plugin');
      plugin = pluginString ? new Plugin(pluginString) : undefined;
    }
    return {method, password, host, port, tag, plugin};
  },

  stringify: (config: Config) => {
    const {host, port, method, password} = config;
    const userInfo = b64Encode(`${method.data}:${password.data}`);
    const uriHost = ShadowsocksUri.getUriFormattedHost(host);
    const hash = ShadowsocksUri.getHash(config.tag);
    const queryString = config.plugin && config.plugin.data ? `?plugin=${config.plugin.data}` : '';
    return `ss://${userInfo}@${uriHost}:${port.data}/${queryString}${hash}`;
  },
};
