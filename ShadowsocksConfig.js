"use strict";
if (typeof exports === "undefined") {
      var exports = {};
    }
    Object.defineProperty(exports, "__esModule", { value: true });
const base_64_1 = require("base-64");
const url_1 = require("url");
// Custom errors
class ShadowsocksConfigError extends Error {
    constructor(message) {
        super(message); // 'Error' breaks prototype chain here if this is transpiled to es5
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = new.target.name;
    }
}
exports.ShadowsocksConfigError = ShadowsocksConfigError;
class InvalidShadowsocksURI extends ShadowsocksConfigError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.InvalidShadowsocksURI = InvalidShadowsocksURI;
// End custom errors
// Self-validating/normalizing config data types subclass this ConfigData class.
// Constructors take a string, validate/normalize/accept if valid, or throw otherwise.
// Some examples (Port is a ConfigData subclass, see below):
//   new Port('')           -> throws
//   new Port('not a port') -> throws
//   new Port('-123')       -> throws
//   new Port('123.4')      -> throws
//   new Port('01234')      -> '1234'
class ConfigData {
    constructor(data) {
        this.data = data;
    }
    toString() {
        return this.data.toString();
    }
}
exports.ConfigData = ConfigData;
function throwErrorForInvalidField(fieldName, fieldValue) {
    throw new ShadowsocksConfigError(`Invalid ${fieldName}: ${fieldValue}`);
}
// Host and Port validation/normalization are built on top of URL for safety and efficiency.
class Host extends ConfigData {
    constructor(data) {
        try {
            const urlParserResult = new url_1.URL(`http://${data}/`);
            super(urlParserResult.hostname);
        }
        catch (_) {
            throwErrorForInvalidField('host', data);
        }
    }
}
exports.Host = Host;
// NOTE: Port data is stored as a string, not a number, as in a URL instance.
class Port extends ConfigData {
    constructor(data) {
        const throwError = () => throwErrorForInvalidField('port', data);
        if (!data)
            throwError();
        try {
            const urlParserResult = new url_1.URL(`http://0.0.0.0:${data}/`);
            super(urlParserResult.port);
        }
        catch (_) {
            throwError();
        }
    }
}
exports.Port = Port;
// A method value must exactly match an element in the set of known ciphers.
// ref: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
class Method extends ConfigData {
    constructor(data) {
        if (!Method.METHODS.has(data)) {
            throwErrorForInvalidField('method', data);
        }
        super(data);
    }
}
Method.METHODS = new Set('rc4-md5 aes-128-gcm aes-192-gcm aes-256-gcm aes-128-cfb aes-192-cfb aes-256-cfb aes-128-ctr aes-192-ctr aes-256-ctr camellia-128-cfb camellia-192-cfb camellia-256-cfb bf-cfb chacha20-ietf-poly1305 salsa20 chacha20 chacha20-ietf'
    .split(' '));
exports.Method = Method;
// Currently no validation is performed for Password, Tag, or Sip003Plugin.
// Client code is responsible for validating and sanitizing these when using with untrusted input.
class Password extends ConfigData {
    constructor(data) {
        super(data);
    }
}
exports.Password = Password;
class Tag extends ConfigData {
    constructor(data) {
        super(data);
    }
}
exports.Tag = Tag;
class Sip003Plugin extends ConfigData {
    constructor(data) {
        super(data);
    }
}
exports.Sip003Plugin = Sip003Plugin;
class ShadowsocksConfig {
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.method = config.method;
        this.password = config.password;
        this.tag = config.tag;
    }
}
exports.ShadowsocksConfig = ShadowsocksConfig;
class ShadowsocksURI extends ShadowsocksConfig {
    constructor(config) {
        super(config);
    }
    static validateProtocol(uri) {
        if (!uri.startsWith('ss://')) {
            throw new InvalidShadowsocksURI(`URI must start with "ss://": ${uri}`);
        }
    }
    static getHash(config) {
        return config.tag ? `#${encodeURIComponent(config.tag.toString())}` : '';
    }
    static parse(uri) {
        let error;
        for (const UriType of [LegacyBase64URI, Sip002URI]) {
            try {
                return UriType.parse(uri);
            }
            catch (e) {
                error = error || e;
            }
        }
        if (!(error instanceof InvalidShadowsocksURI)) {
            const originalErrorName = error.name || '(Unnamed Error)';
            const originalErrorMessage = error.message || '(no error message provided)';
            const originalErrorString = `${originalErrorName}: ${originalErrorMessage}`;
            const newErrorMessage = `Invalid input: ${uri} - Original error: ${originalErrorString}`;
            error = new InvalidShadowsocksURI(newErrorMessage);
        }
        throw error;
    }
}
exports.ShadowsocksURI = ShadowsocksURI;
// Ref: https://shadowsocks.org/en/config/quick-guide.html
class LegacyBase64URI extends ShadowsocksURI {
    constructor(config) {
        super(config);
        const { method, password, host, port } = this;
        const b64EncodedData = base_64_1.encode(`${method}:${password}@${host}:${port}`);
        const dataLength = b64EncodedData.length;
        let paddingLength = 0;
        for (; b64EncodedData[dataLength - 1 - paddingLength] === '='; paddingLength++)
            ;
        this.b64EncodedData = paddingLength === 0 ? b64EncodedData :
            b64EncodedData.substring(0, dataLength - paddingLength);
    }
    static parse(uri) {
        ShadowsocksURI.validateProtocol(uri);
        const hashIndex = uri.indexOf('#');
        let b64EndIndex = hashIndex;
        let tagStartIndex = hashIndex + 1;
        if (hashIndex === -1) {
            b64EndIndex = tagStartIndex = uri.length;
        }
        const tag = new Tag(decodeURIComponent(uri.substring(tagStartIndex)));
        const b64EncodedData = uri.substring('ss://'.length, b64EndIndex);
        const b64DecodedData = base_64_1.decode(b64EncodedData);
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
exports.LegacyBase64URI = LegacyBase64URI;
// Ref: https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html
// NOTE: Currently the plugin query param is preserved on a best-effort basis. It is silently
//       dropped on platforms that do not support the full whatwg URL standard (cf. `searchParams`).
//       Ref:
//         - https://url.spec.whatwg.org/#url-class
//         - https://caniuse.com/#feat=urlsearchparams
class Sip002URI extends ShadowsocksURI {
    constructor(config) {
        super(config);
        const { method, password } = this;
        this.b64EncodedUserInfo = base_64_1.encode(`${method}:${password}`);
        const plugin = config.plugin;
        if (plugin) {
            this.plugin = plugin;
        }
    }
    static parse(uri) {
        ShadowsocksURI.validateProtocol(uri);
        // replace "ss" with "http" so URL built-in parser parses it correctly.
        const inputForUrlParser = `http${uri.substring(2)}`;
        // The built-in URL parser throws as desired when given URIs with invalid syntax.
        const urlParserResult = new url_1.URL(inputForUrlParser);
        const host = new Host(urlParserResult.hostname);
        const port = new Port(urlParserResult.port);
        const tag = new Tag(decodeURIComponent(urlParserResult.hash.substring(1)));
        const b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
        // base64.decode throws as desired when given invalid base64 input.
        const b64DecodedUserInfo = base_64_1.decode(b64EncodedUserInfo);
        const colonIdx = b64DecodedUserInfo.indexOf(':');
        if (colonIdx === -1) {
            throw new InvalidShadowsocksURI(`Missing password part: ${b64DecodedUserInfo}`);
        }
        const methodString = b64DecodedUserInfo.substring(0, colonIdx);
        const method = new Method(methodString);
        const passwordString = b64DecodedUserInfo.substring(colonIdx + 1);
        const password = new Password(passwordString);
        let plugin;
        if (urlParserResult.searchParams) {
            const pluginString = urlParserResult.searchParams.get('plugin');
            plugin = pluginString ? new Sip003Plugin(pluginString) : undefined;
        }
        return new Sip002URI({ method, password, host, port, tag, plugin });
    }
    toString() {
        const { b64EncodedUserInfo, host, port, plugin, tag } = this;
        const queryString = plugin ? `?plugin=${plugin}` : '';
        const hash = ShadowsocksURI.getHash(this);
        return `ss://${b64EncodedUserInfo}@${host}:${port}/${queryString}${hash}`;
    }
}
exports.Sip002URI = Sip002URI;
if (typeof module !== 'undefined') {
    module.exports = {
        ShadowsocksConfigError,
        InvalidShadowsocksURI,
        ConfigData,
        Host,
        Port,
        Method,
        Password,
        Tag,
        Sip003Plugin,
        ShadowsocksConfig,
        ShadowsocksURI,
        LegacyBase64URI,
        Sip002URI,
    };
}
