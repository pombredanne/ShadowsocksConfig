/// <reference types="node" />

const isBrowser = typeof window !== 'undefined';
const b64Encode = isBrowser ? btoa : require('base-64').encode;
const b64Decode = isBrowser ? atob : require('base-64').decode;
const URL = isBrowser ? window.URL : require('url').URL;

// Custom error base class
export class ShadowsocksConfigError extends Error {
  constructor(message: string) {
    super(message);  // 'Error' breaks prototype chain here if this is transpiled to es5
    Object.setPrototypeOf(this, new.target.prototype);  // restore prototype chain
    this.name = new.target.name;
  }
}

export class InvalidConfigField extends ShadowsocksConfigError {
  constructor(public readonly message: string) {
    super(message);
  }
}

export class InvalidURI extends ShadowsocksConfigError {
  constructor(public readonly message: string) {
    super(message);
  }
}
// End custom errors

// Self-validating/normalizing config data types subclass this ConfigField class.
// Constructors take a string, validate/normalize/accept if valid, or throw otherwise.
// Some examples (Port is a ConfigField subclass, see below):
//   new Port('')           -> throws
//   new Port('not a port') -> throws
//   new Port('-123')       -> throws
//   new Port('123.4')      -> throws
//   new Port('01234')      -> '1234'
export class ConfigField {
  constructor(public readonly data: string) {}

  toString() {
    return this.data.toString();
  }
}

function throwErrorForInvalidField(name: string, value: any, reason?: string) {
  throw new InvalidConfigField(`Invalid ${name}: ${value} ${reason || ''}`);
}

export class Host extends ConfigField {
  public static IPV4_PATTERN = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  public static IPV6_PATTERN = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
  public isIPv6: boolean;

  constructor(host: Host | string) {
    if (host instanceof Host) {
      host = host.data;
    }
    super(host);
    this.isIPv6 = Host.IPV6_PATTERN.test(host);
    if (!this.isIPv6 && !Host.IPV4_PATTERN.test(host)) {
      throwErrorForInvalidField('host', host, 'IPv4 or IPv6 address required');
    }
  }
}

export class Port extends ConfigField {
  public static PATTERN = /^[0-9]{1,5}$/;

  constructor(port: Port | string | number) {
    if (port instanceof Port) {
      port = port.data;
    }
    if (typeof port === 'number') {
      // Could be negative or floating point, so stringify. Regex test below will catch it.
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
    super(port.toString());
  }
}

// A method value must exactly match an element in the set of known ciphers.
// ref: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
export class Method extends ConfigField {
  protected static METHODS = new Set([
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

  constructor(method: Method | string) {
    if (method instanceof Method) {
      method = method.data;
    }
    super(method);
    if (!Method.METHODS.has(method)) {
      throwErrorForInvalidField('method', method);
    }
  }
}

// Currently no validation is performed for Password, Tag, or Plugin.
// Client code is responsible for validating and sanitizing these when using with untrusted input.
// TODO: Document this in the README.
export class Password extends ConfigField {
  constructor(password?: Password | string) {
    super((password instanceof Password ? password.data : password) || '');
  }
}

export class Tag extends ConfigField {
  constructor(tag?: Tag | string) {
    super((tag instanceof Tag ? tag.data : tag) || '');
  }
}

export class Plugin extends ConfigField {
  constructor(plugin?: Plugin | string) {
    super((plugin instanceof Plugin ? plugin.data : plugin) || '');
  }
}
// End ConfigField types.

export interface UnsafeConfig {
  host?: Host | string;
  port?: Port | string | number;
  method?: Method | string;
  password?: Password | string;
  tag?: Tag | string;
  plugin?: Plugin | string;  // SIP003 plugin, for applications that support it.
}

export class Config implements UnsafeConfig {
  protected host_: Host;
  protected port_: Port;
  protected method_: Method;
  protected password_: Password;
  protected tag_: Tag;

  constructor(config: UnsafeConfig) {
    // Cast to Config to avoid strictNullChecks errors. The setters that called by the below
    // throw when required values are missing, so we're protected from undefined fields.
    this.host = (config as Config).host;
    this.port = (config as Config).port;
    this.method = (config as Config).method;
    this.password = (config as Config).password;
    this.tag = (config as Config).tag;
  }

  set host(host: Host | string) {
    this.host_ = new Host(host);
  }

  set port(port: Port | string | number) {
    this.port_ = new Port(port);
  }

  set method(method: Method | string) {
    this.method_ = new Method(method);
  }

  set password(password: Password | string) {
    this.password_ = new Password(password);
  }

  set tag(tag: Tag | string) {
    this.tag_ = new Tag(tag);
  }

  get host() {
    return this.host_.toString();
  }

  get port() {
    return this.port_.toString();
  }

  get method() {
    return this.method_.toString();
  }

  get password() {
    return this.password_.toString();
  }

  get tag() {
    return this.tag_.toString();
  }
}

export abstract class ShadowsocksURI extends Config {
  public static readonly PROTOCOL = 'ss:';

  constructor(config: UnsafeConfig) {
    super(new Config(config));
  }

  abstract toString(): string;

  uriFormattedHost() {
    const host = this.host_.data;
    return this.host_.isIPv6 ? `[${host}]` : host;
  }

  static validateProtocol(uri: string) {
    if (!uri.startsWith(ShadowsocksURI.PROTOCOL)) {
      throw new InvalidURI(`URI must start with "${ShadowsocksURI.PROTOCOL}": ${uri}`);
    }
  }

  static getHash(config: UnsafeConfig) {
    const tag = config.tag instanceof Tag ? config.tag.data : config.tag;
    return tag ? `#${encodeURIComponent(tag)}` : '';
  }

  static parse(uri: string): UnsafeConfig {
    let maybeError: (Error | undefined);
    for (const UriType of [LegacyBase64URI, Sip002URI]) {
      try {
        return UriType.parse(uri);
      } catch (e) {
        maybeError = maybeError || e;
      }
    }
    let error = maybeError as Error;
    if (!(error instanceof InvalidURI)) {
      const originalErrorName = (error as Error).name || '(Unnamed Error)';
      const originalErrorMessage = (error as Error).message || '(no error message provided)';
      const originalErrorString = `${originalErrorName}: ${originalErrorMessage}`;
      const newErrorMessage = `Invalid input: ${uri} - Original error: ${originalErrorString}`;
      error = new InvalidURI(newErrorMessage);
    }
    throw error;
  }
}

// Ref: https://shadowsocks.org/en/config/quick-guide.html
export class LegacyBase64URI extends ShadowsocksURI {
  protected b64EncodedData: string;

  constructor(config: UnsafeConfig) {
    super(new Config(config));
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
      throw new InvalidURI(`Missing "@": ${b64DecodedData}`);
    }
    const methodAndPassword = b64DecodedData.substring(0, atSignIndex);
    const methodEndIndex = methodAndPassword.indexOf(':');
    if (methodEndIndex === -1) {
      throw new InvalidURI(`Missing password part: ${methodAndPassword}`);
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
      throw new InvalidURI(`Missing port part: ${hostAndPort}`);
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
  protected plugin_: Plugin;

  constructor(config: UnsafeConfig) {
    super(new Config(config));
    const { method, password } = this;
    this.b64EncodedUserInfo = b64Encode(`${method}:${password}`);
    this.plugin = (config as Sip002URI).plugin;
  }

  set plugin(plugin: Plugin | string | undefined) {
    this.plugin_ = new Plugin(plugin);
  }

  get plugin() {
    return this.plugin_.toString();
  }

  static parse(uri: string) {
    ShadowsocksURI.validateProtocol(uri);
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
      throw new InvalidURI(`Missing password part: ${b64DecodedUserInfo}`);
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
    return new Sip002URI({ method, password, host, port, tag, plugin } as Sip002URI);
  }

  toString() {
    const { b64EncodedUserInfo, host, port, plugin, tag } = this;
    const queryString = plugin ? `?plugin=${plugin}` : '';
    const hash = ShadowsocksURI.getHash(this);
    const uriHost = this.uriFormattedHost();
    return `ss://${b64EncodedUserInfo}@${uriHost}:${port}/${queryString}${hash}`;
  }
}
