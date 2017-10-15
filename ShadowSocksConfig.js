"use strict";
if (typeof exports === "undefined") {
  var exports = {};
}
Object.defineProperty(exports, "__esModule", { value: true });
// list of cipher method values: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
var Method;
(function (Method) {
    Method["RC4_MD5"] = "rc4-md5";
    Method["AES_128_GCM"] = "aes-128-gcm";
    Method["AES_192_GCM"] = "aes-192-gcm";
    Method["AES_256_GCM"] = "aes-256-gcm";
    Method["AES_128_CFB"] = "aes-128-cfb";
    Method["AES_192_CFB"] = "aes-192-cfb";
    Method["AES_256_CFB"] = "aes-256-cfb";
    Method["AES_128_CTR"] = "aes-128-ctr";
    Method["AES_192_CTR"] = "aes-192-ctr";
    Method["AES_256_CTR"] = "aes-256-ctr";
    Method["CAMELLIA_128_CFB"] = "camellia-128-cfb";
    Method["CAMELLIA_192_CFB"] = "camellia-192-cfb";
    Method["CAMELLIA_256_CFB"] = "camellia-256-cfb";
    Method["BF_CFB"] = "bf-cfb";
    Method["CHACHA20-IETF-POLY1305"] = "chacha20-ietf-poly1305";
    Method["SALSA20"] = "salsa20";
    Method["CHACHA20"] = "chacha20";
    Method["CHACHA20_IETF"] = "chacha20-ietf";
})(Method = exports.Method || (exports.Method = {}));
class ShadowsocksConfigError extends Error {
    constructor(message) {
        // ref: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        super(message); // 'Error' breaks prototype chain here
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
// ref: https://shadowsocks.org/en/config/quick-guide.html
class ShadowSocksURI {
    constructor(data, type) {
        this.type = type;
        this.type = type;
        for (const key in data) {
            this[key] = data[key];
        }
    }
    toString() {
        return this.type.toString(this);
    }
}
exports.ShadowSocksURI = ShadowSocksURI;
class Base64URI {
    static parse(urlString) {
        const data = {};
        return new ShadowSocksURI(data, Base64URI);
    }
    static toString(data) {
        return "ss://";
    }
    static isValid(urlString) {
        return !urlString.includes('@');
    }
}
class Sip002URI {
    static parse(urlString) {
        const data = {};
        return new ShadowSocksURI(data, Sip002URI);
    }
    static toString(data) {
        return "ss://base64";
    }
    static isValid(urlString) {
        return urlString.includes('@');
    }
}
function parseURI(input) {
    if (Base64URI.isValid(input)) {
        return Base64URI.parse(input);
    }
    else if (Sip002URI.isValid(input)) {
        return Sip002URI.parse(input);
    }
    throw new Error('Invalid URL');
}
exports.parseURI = parseURI;
if (typeof module !== "undefined") {
    module.exports = {
        ShadowSocksURI,
        Base64URI,
        Sip002URI,
        parseURI
    };
}
