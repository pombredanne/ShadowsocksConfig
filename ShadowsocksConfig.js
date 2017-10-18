"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function() {
const isNode = (typeof module !== 'undefined'); 
const _module_exports = (function() {
    if (isNode) {
        return  module.exports;
    } else if (typeof window !== 'undefined') {
        return window;
    }
    throw new Error('Import failed: incompatible import interface');
})();
var b64Encode = isNode ? require('base-64').encode : btoa;
var b64Decode = isNode ? require('base-64').decode : atob;
var URL = isNode ? require('url').URL : window.URL;
var ShadowsocksConfigError = (function (_super) {
    __extends(ShadowsocksConfigError, _super);
    function ShadowsocksConfigError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.name = _newTarget.name;
        return _this;
    }
    return ShadowsocksConfigError;
}(Error));
exports.ShadowsocksConfigError = ShadowsocksConfigError;
var InvalidShadowsocksURI = (function (_super) {
    __extends(InvalidShadowsocksURI, _super);
    function InvalidShadowsocksURI(message) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        return _this;
    }
    return InvalidShadowsocksURI;
}(ShadowsocksConfigError));
exports.InvalidShadowsocksURI = InvalidShadowsocksURI;
var ConfigData = (function () {
    function ConfigData(data) {
        this.data = data;
        this.validate(data);
    }
    ConfigData.prototype.toString = function () {
        return this.data.toString();
    };
    ConfigData.prototype.validate = function (data) {
        if (typeof this.pattern !== 'undefined') {
        }
    };
    ConfigData.prototype.throwErrorForInvalidField = function (value) {
        var name = this.constructor.name;
        throw new ShadowsocksConfigError("Invalid " + name + ": " + value);
    };
    return ConfigData;
}());
exports.ConfigData = ConfigData;
var Host = (function (_super) {
    __extends(Host, _super);
    function Host(data) {
        var _this = this;
        try {
            var urlParserResult = new URL("http://" + data + "/");
            _this = _super.call(this, urlParserResult.hostname) || this;
        }
        catch (_) {
            _this.throwErrorForInvalidField(data);
        }
        return _this;
    }
    return Host;
}(ConfigData));
exports.Host = Host;
var Port = (function (_super) {
    __extends(Port, _super);
    function Port(data) {
        var _this = this;
        var throwError = function () { return _this.throwErrorForInvalidField(data); };
        if (!data)
            throwError();
        try {
            var urlParserResult = new URL("http://0.0.0.0:" + data + "/");
            _this = _super.call(this, urlParserResult.port) || this;
        }
        catch (_) {
            throwError();
        }
        return _this;
    }
    return Port;
}(ConfigData));
exports.Port = Port;
var Method = (function (_super) {
    __extends(Method, _super);
    function Method(data) {
        return _super.call(this, data) || this;
    }
    Method.prototype.validate = function (data) {
        if (!Method.METHODS.has(data)) {
            this.throwErrorForInvalidField(data);
        }
    };
    Method.METHODS = new Set([
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
    return Method;
}(ConfigData));
exports.Method = Method;
var Password = (function (_super) {
    __extends(Password, _super);
    function Password(data) {
        return _super.call(this, data) || this;
    }
    return Password;
}(ConfigData));
exports.Password = Password;
var Tag = (function (_super) {
    __extends(Tag, _super);
    function Tag(data) {
        var _this = _super.call(this, data) || this;
        _this.pattern = /^[A-z0-9-]+$/;
        return _this;
    }
    return Tag;
}(ConfigData));
exports.Tag = Tag;
var Sip003Plugin = (function (_super) {
    __extends(Sip003Plugin, _super);
    function Sip003Plugin(data) {
        return _super.call(this, data) || this;
    }
    return Sip003Plugin;
}(ConfigData));
exports.Sip003Plugin = Sip003Plugin;
var ShadowsocksConfig = (function () {
    function ShadowsocksConfig(config) {
        this.host = config.host;
        this.port = config.port;
        this.method = config.method;
        this.password = config.password;
        this.tag = config.tag;
    }
    return ShadowsocksConfig;
}());
exports.ShadowsocksConfig = ShadowsocksConfig;
var ShadowsocksURI = (function (_super) {
    __extends(ShadowsocksURI, _super);
    function ShadowsocksURI(config) {
        return _super.call(this, config) || this;
    }
    ShadowsocksURI.validateProtocol = function (uri) {
        if (!uri.startsWith('ss://')) {
            throw new InvalidShadowsocksURI("URI must start with \"ss://\": " + uri);
        }
    };
    ShadowsocksURI.getHash = function (config) {
        return config.tag ? "#" + encodeURIComponent(config.tag.toString()) : '';
    };
    ShadowsocksURI.parse = function (uri) {
        var error;
        for (var _i = 0, _a = [LegacyBase64URI, Sip002URI]; _i < _a.length; _i++) {
            var UriType = _a[_i];
            try {
                return UriType.parse(uri);
            }
            catch (e) {
                error = error || e;
            }
        }
        if (!(error instanceof InvalidShadowsocksURI)) {
            var originalErrorName = error.name || '(Unnamed Error)';
            var originalErrorMessage = error.message || '(no error message provided)';
            var originalErrorString = originalErrorName + ": " + originalErrorMessage;
            var newErrorMessage = "Invalid input: " + uri + " - Original error: " + originalErrorString;
            error = new InvalidShadowsocksURI(newErrorMessage);
        }
        throw error;
    };
    return ShadowsocksURI;
}(ShadowsocksConfig));
exports.ShadowsocksURI = ShadowsocksURI;
var LegacyBase64URI = (function (_super) {
    __extends(LegacyBase64URI, _super);
    function LegacyBase64URI(config) {
        var _this = _super.call(this, config) || this;
        var _a = _this, method = _a.method, password = _a.password, host = _a.host, port = _a.port;
        var b64EncodedData = b64Encode(method + ":" + password + "@" + host + ":" + port);
        var dataLength = b64EncodedData.length;
        var paddingLength = 0;
        for (; b64EncodedData[dataLength - 1 - paddingLength] === '='; paddingLength++)
            ;
        _this.b64EncodedData = paddingLength === 0 ? b64EncodedData :
            b64EncodedData.substring(0, dataLength - paddingLength);
        return _this;
    }
    LegacyBase64URI.parse = function (uri) {
        ShadowsocksURI.validateProtocol(uri);
        var hashIndex = uri.indexOf('#');
        var b64EndIndex = hashIndex;
        var tagStartIndex = hashIndex + 1;
        if (hashIndex === -1) {
            b64EndIndex = tagStartIndex = uri.length;
        }
        var tag = new Tag(decodeURIComponent(uri.substring(tagStartIndex)));
        var b64EncodedData = uri.substring('ss://'.length, b64EndIndex);
        var b64DecodedData = b64Decode(b64EncodedData);
        var atSignIndex = b64DecodedData.indexOf('@');
        if (atSignIndex === -1) {
            throw new InvalidShadowsocksURI("Missing \"@\": " + b64DecodedData);
        }
        var methodAndPassword = b64DecodedData.substring(0, atSignIndex);
        var methodEndIndex = methodAndPassword.indexOf(':');
        if (methodEndIndex === -1) {
            throw new InvalidShadowsocksURI("Missing password part: " + methodAndPassword);
        }
        var methodString = methodAndPassword.substring(0, methodEndIndex);
        var method = new Method(methodString);
        var passwordStartIndex = methodEndIndex + 1;
        var passwordString = methodAndPassword.substring(passwordStartIndex);
        var password = new Password(passwordString);
        var hostStartIndex = atSignIndex + 1;
        var hostAndPort = b64DecodedData.substring(hostStartIndex);
        var hostEndIndex = hostAndPort.indexOf(':');
        if (hostEndIndex === -1) {
            throw new InvalidShadowsocksURI("Missing port part: " + hostAndPort);
        }
        var host = new Host(hostAndPort.substring(0, hostEndIndex));
        var portStartIndex = hostEndIndex + 1;
        var portString = hostAndPort.substring(portStartIndex);
        var port = new Port(portString);
        return new LegacyBase64URI({ method: method, password: password, host: host, port: port, tag: tag });
    };
    LegacyBase64URI.prototype.toString = function () {
        var _a = this, b64EncodedData = _a.b64EncodedData, tag = _a.tag;
        var hash = ShadowsocksURI.getHash(this);
        return "ss://" + b64EncodedData + hash;
    };
    return LegacyBase64URI;
}(ShadowsocksURI));
exports.LegacyBase64URI = LegacyBase64URI;
var Sip002URI = (function (_super) {
    __extends(Sip002URI, _super);
    function Sip002URI(config) {
        var _this = _super.call(this, config) || this;
        var _a = _this, method = _a.method, password = _a.password;
        _this.b64EncodedUserInfo = b64Encode(method + ":" + password);
        var plugin = config.plugin;
        if (plugin) {
            _this.plugin = plugin;
        }
        return _this;
    }
    Sip002URI.parse = function (uri) {
        ShadowsocksURI.validateProtocol(uri);
        var inputForUrlParser = "http" + uri.substring(2);
        var urlParserResult = new URL(inputForUrlParser);
        var host = new Host(urlParserResult.hostname);
        var port = new Port(urlParserResult.port);
        var tag = new Tag(decodeURIComponent(urlParserResult.hash.substring(1)));
        var b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
        var b64DecodedUserInfo = b64Decode(b64EncodedUserInfo);
        var colonIdx = b64DecodedUserInfo.indexOf(':');
        if (colonIdx === -1) {
            throw new InvalidShadowsocksURI("Missing password part: " + b64DecodedUserInfo);
        }
        var methodString = b64DecodedUserInfo.substring(0, colonIdx);
        var method = new Method(methodString);
        var passwordString = b64DecodedUserInfo.substring(colonIdx + 1);
        var password = new Password(passwordString);
        var plugin;
        if (urlParserResult.searchParams) {
            var pluginString = urlParserResult.searchParams.get('plugin');
            plugin = pluginString ? new Sip003Plugin(pluginString) : undefined;
        }
        return new Sip002URI({ method: method, password: password, host: host, port: port, tag: tag, plugin: plugin });
    };
    Sip002URI.prototype.toString = function () {
        var _a = this, b64EncodedUserInfo = _a.b64EncodedUserInfo, host = _a.host, port = _a.port, plugin = _a.plugin, tag = _a.tag;
        var queryString = plugin ? "?plugin=" + plugin : '';
        var hash = ShadowsocksURI.getHash(this);
        return "ss://" + b64EncodedUserInfo + "@" + host + ":" + port + "/" + queryString + hash;
    };
    return Sip002URI;
}(ShadowsocksURI));
exports.Sip002URI = Sip002URI;
if (typeof module !== 'undefined' && module.exports) {
    module.exports;
}
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,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RCxDQWhEQSxBQWdEQyxDQWhEOEIsY0FBYyxHQWdENUM7QUFoRFksOEJBQVM7QUFrRHRCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFBO0FBQ2hCLENBQUMiLCJmaWxlIjoiU2hhZG93c29ja3NDb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5kZWNsYXJlIHZhciBpc05vZGU6IGJvb2xlYW47XG5cbmNvbnN0IGI2NEVuY29kZSA9IGlzTm9kZSA/IHJlcXVpcmUoJ2Jhc2UtNjQnKS5lbmNvZGUgOiBidG9hO1xuY29uc3QgYjY0RGVjb2RlID0gaXNOb2RlID8gcmVxdWlyZSgnYmFzZS02NCcpLmRlY29kZSA6IGF0b2I7XG5jb25zdCBVUkwgPSBpc05vZGUgPyByZXF1aXJlKCd1cmwnKS5VUkwgOiB3aW5kb3cuVVJMO1xuXG4vLyBOb2RlIGNvbXBhdGliaWxpdHkgLSBhbGxvd3MgcnVubmluZyBtb2NoYSB0ZXN0czpcblxuLy8gQ3VzdG9tIGVycm9yc1xuZXhwb3J0IGNsYXNzIFNoYWRvd3NvY2tzQ29uZmlnRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpOyAgLy8gJ0Vycm9yJyBicmVha3MgcHJvdG90eXBlIGNoYWluIGhlcmUgaWYgdGhpcyBpcyB0cmFuc3BpbGVkIHRvIGVzNVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBuZXcudGFyZ2V0LnByb3RvdHlwZSk7ICAvLyByZXN0b3JlIHByb3RvdHlwZSBjaGFpblxuICAgIHRoaXMubmFtZSA9IG5ldy50YXJnZXQubmFtZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZFNoYWRvd3NvY2tzVVJJIGV4dGVuZHMgU2hhZG93c29ja3NDb25maWdFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuLy8gRW5kIGN1c3RvbSBlcnJvcnNcblxuXG4vLyBTZWxmLXZhbGlkYXRpbmcvbm9ybWFsaXppbmcgY29uZmlnIGRhdGEgdHlwZXMgc3ViY2xhc3MgdGhpcyBDb25maWdEYXRhIGNsYXNzLlxuLy8gQ29uc3RydWN0b3JzIHRha2UgYSBzdHJpbmcsIHZhbGlkYXRlL25vcm1hbGl6ZS9hY2NlcHQgaWYgdmFsaWQsIG9yIHRocm93IG90aGVyd2lzZS5cbi8vIFNvbWUgZXhhbXBsZXMgKFBvcnQgaXMgYSBDb25maWdEYXRhIHN1YmNsYXNzLCBzZWUgYmVsb3cpOlxuLy8gICBuZXcgUG9ydCgnJykgICAgICAgICAgIC0+IHRocm93c1xuLy8gICBuZXcgUG9ydCgnbm90IGEgcG9ydCcpIC0+IHRocm93c1xuLy8gICBuZXcgUG9ydCgnLTEyMycpICAgICAgIC0+IHRocm93c1xuLy8gICBuZXcgUG9ydCgnMTIzLjQnKSAgICAgIC0+IHRocm93c1xuLy8gICBuZXcgUG9ydCgnMDEyMzQnKSAgICAgIC0+ICcxMjM0J1xuZXhwb3J0IGNsYXNzIENvbmZpZ0RhdGEge1xuXG4gIHB1YmxpYyBwYXR0ZXJuOiBSZWdFeHAgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGRhdGE6IHN0cmluZykge1xuICAgIHRoaXMudmFsaWRhdGUoZGF0YSk7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnRvU3RyaW5nKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdmFsaWRhdGUoZGF0YTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gd2hlbiB0aGVyZSBpcyBhIHBhdHRlcm4gZGVmaW5lZCwgYnV0IHZhbGlkYXRlIHdhcyBub3Qgb3ZlcmxvYWRlZFxuICAgIGlmICh0eXBlb2YgdGhpcy5wYXR0ZXJuICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHRocm93RXJyb3JGb3JJbnZhbGlkRmllbGQodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgdGhyb3cgbmV3IFNoYWRvd3NvY2tzQ29uZmlnRXJyb3IoYEludmFsaWQgJHtuYW1lfTogJHt2YWx1ZX1gKTtcbiAgfVxuXG59XG5cbi8vIEhvc3QgYW5kIFBvcnQgdmFsaWRhdGlvbi9ub3JtYWxpemF0aW9uIGFyZSBidWlsdCBvbiB0b3Agb2YgVVJMIGZvciBzYWZldHkgYW5kIGVmZmljaWVuY3kuXG5leHBvcnQgY2xhc3MgSG9zdCBleHRlbmRzIENvbmZpZ0RhdGEge1xuICBjb25zdHJ1Y3RvcihkYXRhOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsUGFyc2VyUmVzdWx0ID0gbmV3IFVSTChgaHR0cDovLyR7ZGF0YX0vYCk7XG4gICAgICBzdXBlcih1cmxQYXJzZXJSZXN1bHQuaG9zdG5hbWUpO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHRoaXMudGhyb3dFcnJvckZvckludmFsaWRGaWVsZChkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gTk9URTogUG9ydCBkYXRhIGlzIHN0b3JlZCBhcyBhIHN0cmluZywgbm90IGEgbnVtYmVyLCBhcyBpbiBhIFVSTCBpbnN0YW5jZS5cbmV4cG9ydCBjbGFzcyBQb3J0IGV4dGVuZHMgQ29uZmlnRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IHRocm93RXJyb3IgPSAoKSA9PiB0aGlzLnRocm93RXJyb3JGb3JJbnZhbGlkRmllbGQoZGF0YSk7XG4gICAgaWYgKCFkYXRhKSB0aHJvd0Vycm9yKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHVybFBhcnNlclJlc3VsdCA9IG5ldyBVUkwoYGh0dHA6Ly8wLjAuMC4wOiR7ZGF0YX0vYCk7XG4gICAgICBzdXBlcih1cmxQYXJzZXJSZXN1bHQucG9ydCk7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBBIG1ldGhvZCB2YWx1ZSBtdXN0IGV4YWN0bHkgbWF0Y2ggYW4gZWxlbWVudCBpbiB0aGUgc2V0IG9mIGtub3duIGNpcGhlcnMuXG4vLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaGFkb3dzb2Nrcy9zaGFkb3dzb2Nrcy1saWJldi9ibG9iLzEwYTJkM2UzL2NvbXBsZXRpb25zL2Jhc2gvc3MtcmVkaXIjTDVcbmV4cG9ydCBjbGFzcyBNZXRob2QgZXh0ZW5kcyBDb25maWdEYXRhIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUVUSE9EUyA9IG5ldyBTZXQoW1xuICAgICdyYzQtbWQ1JyxcbiAgICAnYWVzLTEyOC1nY20nLFxuICAgICdhZXMtMTkyLWdjbScsXG4gICAgJ2Flcy0yNTYtZ2NtJyxcbiAgICAnYWVzLTEyOC1jZmInLFxuICAgICdhZXMtMTkyLWNmYicsXG4gICAgJ2Flcy0yNTYtY2ZiJyxcbiAgICAnYWVzLTEyOC1jdHInLFxuICAgICdhZXMtMTkyLWN0cicsXG4gICAgJ2Flcy0yNTYtY3RyJyxcbiAgICAnY2FtZWxsaWEtMTI4LWNmYicsXG4gICAgJ2NhbWVsbGlhLTE5Mi1jZmInLFxuICAgICdjYW1lbGxpYS0yNTYtY2ZiJyxcbiAgICAnYmYtY2ZiJyxcbiAgICAnY2hhY2hhMjAtaWV0Zi1wb2x5MTMwNScsXG4gICAgJ3NhbHNhMjAnLFxuICAgICdjaGFjaGEyMCcsXG4gICAgJ2NoYWNoYTIwLWlldGYnXG4gICBdKTtcblxuICBjb25zdHJ1Y3RvcihkYXRhOiBzdHJpbmcpIHtcbiAgICBzdXBlcihkYXRhKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB2YWxpZGF0ZShkYXRhOiBzdHJpbmcpIHtcbiAgICBpZiAoIU1ldGhvZC5NRVRIT0RTLmhhcyhkYXRhKSkge1xuICAgICAgdGhpcy50aHJvd0Vycm9yRm9ySW52YWxpZEZpZWxkKGRhdGEpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFzc3dvcmQgZXh0ZW5kcyBDb25maWdEYXRhIHtcbiAgY29uc3RydWN0b3IoZGF0YTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZGF0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRhZyBleHRlbmRzIENvbmZpZ0RhdGEge1xuICBwdWJsaWMgcGF0dGVybiA9IC9eW0EtejAtOS1dKyQvO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHN0cmluZykge1xuICAgIHN1cGVyKGRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaXAwMDNQbHVnaW4gZXh0ZW5kcyBDb25maWdEYXRhIHtcbiAgY29uc3RydWN0b3IoZGF0YTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZGF0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNoYWRvd3NvY2tzQ29uZmlnIHtcbiAgaG9zdD86IEhvc3Q7XG4gIHBvcnQ/OiBQb3J0O1xuICBtZXRob2Q/OiBNZXRob2Q7XG4gIHBhc3N3b3JkPzogUGFzc3dvcmQ7XG4gIHRhZz86IFRhZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFNoYWRvd3NvY2tzQ29uZmlnKSB7XG4gICAgdGhpcy5ob3N0ID0gY29uZmlnLmhvc3Q7XG4gICAgdGhpcy5wb3J0ID0gY29uZmlnLnBvcnQ7XG4gICAgdGhpcy5tZXRob2QgPSBjb25maWcubWV0aG9kO1xuICAgIHRoaXMucGFzc3dvcmQgPSBjb25maWcucGFzc3dvcmQ7XG4gICAgdGhpcy50YWcgPSBjb25maWcudGFnO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaGFkb3dzb2Nrc1VSSSBleHRlbmRzIFNoYWRvd3NvY2tzQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnOiBTaGFkb3dzb2Nrc0NvbmZpZykge1xuICAgIHN1cGVyKGNvbmZpZyk7XG4gIH1cblxuICBhYnN0cmFjdCB0b1N0cmluZygpOiBzdHJpbmc7XG5cbiAgc3RhdGljIHZhbGlkYXRlUHJvdG9jb2wodXJpOiBzdHJpbmcpIHtcbiAgICBpZiAoIXVyaS5zdGFydHNXaXRoKCdzczovLycpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBVUkkgbXVzdCBzdGFydCB3aXRoIFwic3M6Ly9cIjogJHt1cml9YCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldEhhc2goY29uZmlnOiBTaGFkb3dzb2Nrc0NvbmZpZykge1xuICAgIHJldHVybiBjb25maWcudGFnID8gYCMke2VuY29kZVVSSUNvbXBvbmVudChjb25maWcudGFnLnRvU3RyaW5nKCkpfWAgOiAnJztcbiAgfVxuXG4gIHN0YXRpYyBwYXJzZSh1cmk6IHN0cmluZyk6IFNoYWRvd3NvY2tzQ29uZmlnIHtcbiAgICBsZXQgZXJyb3I6IEVycm9yO1xuICAgIGZvciAoY29uc3QgVXJpVHlwZSBvZiBbTGVnYWN5QmFzZTY0VVJJLCBTaXAwMDJVUkldKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gVXJpVHlwZS5wYXJzZSh1cmkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnJvciA9IGVycm9yIHx8IGU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFNoYWRvd3NvY2tzVVJJKSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxFcnJvck5hbWUgPSAoZXJyb3IgYXMgRXJyb3IpLm5hbWUgfHwgJyhVbm5hbWVkIEVycm9yKSc7XG4gICAgICBjb25zdCBvcmlnaW5hbEVycm9yTWVzc2FnZSA9IChlcnJvciBhcyBFcnJvcikubWVzc2FnZSB8fCAnKG5vIGVycm9yIG1lc3NhZ2UgcHJvdmlkZWQpJztcbiAgICAgIGNvbnN0IG9yaWdpbmFsRXJyb3JTdHJpbmcgPSBgJHtvcmlnaW5hbEVycm9yTmFtZX06ICR7b3JpZ2luYWxFcnJvck1lc3NhZ2V9YDtcbiAgICAgIGNvbnN0IG5ld0Vycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiAke3VyaX0gLSBPcmlnaW5hbCBlcnJvcjogJHtvcmlnaW5hbEVycm9yU3RyaW5nfWA7XG4gICAgICBlcnJvciA9IG5ldyBJbnZhbGlkU2hhZG93c29ja3NVUkkobmV3RXJyb3JNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLy8gUmVmOiBodHRwczovL3NoYWRvd3NvY2tzLm9yZy9lbi9jb25maWcvcXVpY2stZ3VpZGUuaHRtbFxuZXhwb3J0IGNsYXNzIExlZ2FjeUJhc2U2NFVSSSBleHRlbmRzIFNoYWRvd3NvY2tzVVJJIHtcbiAgYjY0RW5jb2RlZERhdGE6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFNoYWRvd3NvY2tzQ29uZmlnKSB7XG4gICAgc3VwZXIoY29uZmlnKTtcbiAgICBjb25zdCB7IG1ldGhvZCwgcGFzc3dvcmQsIGhvc3QsIHBvcnQgfSA9IHRoaXM7XG4gICAgY29uc3QgYjY0RW5jb2RlZERhdGEgPSBiNjRFbmNvZGUoYCR7bWV0aG9kfToke3Bhc3N3b3JkfUAke2hvc3R9OiR7cG9ydH1gKTtcbiAgICBjb25zdCBkYXRhTGVuZ3RoID0gYjY0RW5jb2RlZERhdGEubGVuZ3RoO1xuICAgIGxldCBwYWRkaW5nTGVuZ3RoID0gMDtcbiAgICBmb3IgKDsgYjY0RW5jb2RlZERhdGFbZGF0YUxlbmd0aCAtIDEgLSBwYWRkaW5nTGVuZ3RoXSA9PT0gJz0nOyBwYWRkaW5nTGVuZ3RoKyspO1xuICAgIHRoaXMuYjY0RW5jb2RlZERhdGEgPSBwYWRkaW5nTGVuZ3RoID09PSAwID8gYjY0RW5jb2RlZERhdGEgOlxuICAgICAgICBiNjRFbmNvZGVkRGF0YS5zdWJzdHJpbmcoMCwgZGF0YUxlbmd0aCAtIHBhZGRpbmdMZW5ndGgpO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlKHVyaTogc3RyaW5nKSB7XG4gICAgU2hhZG93c29ja3NVUkkudmFsaWRhdGVQcm90b2NvbCh1cmkpO1xuICAgIGNvbnN0IGhhc2hJbmRleCA9IHVyaS5pbmRleE9mKCcjJyk7XG4gICAgbGV0IGI2NEVuZEluZGV4ID0gaGFzaEluZGV4O1xuICAgIGxldCB0YWdTdGFydEluZGV4ID0gaGFzaEluZGV4ICsgMTtcbiAgICBpZiAoaGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgYjY0RW5kSW5kZXggPSB0YWdTdGFydEluZGV4ID0gdXJpLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgdGFnID0gbmV3IFRhZyhkZWNvZGVVUklDb21wb25lbnQodXJpLnN1YnN0cmluZyh0YWdTdGFydEluZGV4KSkpO1xuICAgIGNvbnN0IGI2NEVuY29kZWREYXRhID0gdXJpLnN1YnN0cmluZygnc3M6Ly8nLmxlbmd0aCwgYjY0RW5kSW5kZXgpO1xuICAgIGNvbnN0IGI2NERlY29kZWREYXRhID0gYjY0RGVjb2RlKGI2NEVuY29kZWREYXRhKTtcbiAgICBjb25zdCBhdFNpZ25JbmRleCA9IGI2NERlY29kZWREYXRhLmluZGV4T2YoJ0AnKTtcbiAgICBpZiAoYXRTaWduSW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBNaXNzaW5nIFwiQFwiOiAke2I2NERlY29kZWREYXRhfWApO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2RBbmRQYXNzd29yZCA9IGI2NERlY29kZWREYXRhLnN1YnN0cmluZygwLCBhdFNpZ25JbmRleCk7XG4gICAgY29uc3QgbWV0aG9kRW5kSW5kZXggPSBtZXRob2RBbmRQYXNzd29yZC5pbmRleE9mKCc6Jyk7XG4gICAgaWYgKG1ldGhvZEVuZEluZGV4ID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRTaGFkb3dzb2Nrc1VSSShgTWlzc2luZyBwYXNzd29yZCBwYXJ0OiAke21ldGhvZEFuZFBhc3N3b3JkfWApO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2RTdHJpbmcgPSBtZXRob2RBbmRQYXNzd29yZC5zdWJzdHJpbmcoMCwgbWV0aG9kRW5kSW5kZXgpO1xuICAgIGNvbnN0IG1ldGhvZCA9IG5ldyBNZXRob2QobWV0aG9kU3RyaW5nKTtcbiAgICBjb25zdCBwYXNzd29yZFN0YXJ0SW5kZXggPSBtZXRob2RFbmRJbmRleCArIDE7XG4gICAgY29uc3QgcGFzc3dvcmRTdHJpbmcgPSBtZXRob2RBbmRQYXNzd29yZC5zdWJzdHJpbmcocGFzc3dvcmRTdGFydEluZGV4KTtcbiAgICBjb25zdCBwYXNzd29yZCA9IG5ldyBQYXNzd29yZChwYXNzd29yZFN0cmluZyk7XG4gICAgY29uc3QgaG9zdFN0YXJ0SW5kZXggPSBhdFNpZ25JbmRleCArIDE7XG4gICAgY29uc3QgaG9zdEFuZFBvcnQgPSBiNjREZWNvZGVkRGF0YS5zdWJzdHJpbmcoaG9zdFN0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IGhvc3RFbmRJbmRleCA9IGhvc3RBbmRQb3J0LmluZGV4T2YoJzonKTtcbiAgICBpZiAoaG9zdEVuZEluZGV4ID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRTaGFkb3dzb2Nrc1VSSShgTWlzc2luZyBwb3J0IHBhcnQ6ICR7aG9zdEFuZFBvcnR9YCk7XG4gICAgfVxuICAgIGNvbnN0IGhvc3QgPSBuZXcgSG9zdChob3N0QW5kUG9ydC5zdWJzdHJpbmcoMCwgaG9zdEVuZEluZGV4KSk7XG4gICAgY29uc3QgcG9ydFN0YXJ0SW5kZXggPSBob3N0RW5kSW5kZXggKyAxO1xuICAgIGNvbnN0IHBvcnRTdHJpbmcgPSBob3N0QW5kUG9ydC5zdWJzdHJpbmcocG9ydFN0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IHBvcnQgPSBuZXcgUG9ydChwb3J0U3RyaW5nKTtcbiAgICByZXR1cm4gbmV3IExlZ2FjeUJhc2U2NFVSSSh7IG1ldGhvZCwgcGFzc3dvcmQsIGhvc3QsIHBvcnQsIHRhZyB9KTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IHsgYjY0RW5jb2RlZERhdGEsIHRhZyB9ID0gdGhpcztcbiAgICBjb25zdCBoYXNoID0gU2hhZG93c29ja3NVUkkuZ2V0SGFzaCh0aGlzKTtcbiAgICByZXR1cm4gYHNzOi8vJHtiNjRFbmNvZGVkRGF0YX0ke2hhc2h9YDtcbiAgfVxufVxuXG4vLyBSZWY6IGh0dHBzOi8vc2hhZG93c29ja3Mub3JnL2VuL3NwZWMvU0lQMDAyLVVSSS1TY2hlbWUuaHRtbFxuLy8gTk9URTogQ3VycmVudGx5IHRoZSBwbHVnaW4gcXVlcnkgcGFyYW0gaXMgcHJlc2VydmVkIG9uIGEgYmVzdC1lZmZvcnQgYmFzaXMuIEl0IGlzIHNpbGVudGx5XG4vLyAgICAgICBkcm9wcGVkIG9uIHBsYXRmb3JtcyB0aGF0IGRvIG5vdCBzdXBwb3J0IHRoZSBmdWxsIHdoYXR3ZyBVUkwgc3RhbmRhcmQgKGNmLiBgc2VhcmNoUGFyYW1zYCkuXG4vLyAgICAgICBSZWY6XG4vLyAgICAgICAgIC0gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmwtY2xhc3Ncbi8vICAgICAgICAgLSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PXVybHNlYXJjaHBhcmFtc1xuZXhwb3J0IGNsYXNzIFNpcDAwMlVSSSBleHRlbmRzIFNoYWRvd3NvY2tzVVJJIHtcbiAgYjY0RW5jb2RlZFVzZXJJbmZvOiBzdHJpbmc7XG4gIHBsdWdpbj86IFNpcDAwM1BsdWdpbjtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFNoYWRvd3NvY2tzQ29uZmlnKSB7XG4gICAgc3VwZXIoY29uZmlnKTtcbiAgICBjb25zdCB7IG1ldGhvZCwgcGFzc3dvcmQgfSA9IHRoaXM7XG4gICAgdGhpcy5iNjRFbmNvZGVkVXNlckluZm8gPSBiNjRFbmNvZGUoYCR7bWV0aG9kfToke3Bhc3N3b3JkfWApO1xuICAgIGNvbnN0IHBsdWdpbiA9IChjb25maWcgYXMgU2lwMDAyVVJJKS5wbHVnaW47XG4gICAgaWYgKHBsdWdpbikge1xuICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4gYXMgU2lwMDAzUGx1Z2luO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBwYXJzZSh1cmk6IHN0cmluZykge1xuICAgIFNoYWRvd3NvY2tzVVJJLnZhbGlkYXRlUHJvdG9jb2wodXJpKTtcbiAgICAvLyByZXBsYWNlIFwic3NcIiB3aXRoIFwiaHR0cFwiIHNvIFVSTCBidWlsdC1pbiBwYXJzZXIgcGFyc2VzIGl0IGNvcnJlY3RseS5cbiAgICBjb25zdCBpbnB1dEZvclVybFBhcnNlciA9IGBodHRwJHt1cmkuc3Vic3RyaW5nKDIpfWA7XG4gICAgLy8gVGhlIGJ1aWx0LWluIFVSTCBwYXJzZXIgdGhyb3dzIGFzIGRlc2lyZWQgd2hlbiBnaXZlbiBVUklzIHdpdGggaW52YWxpZCBzeW50YXguXG4gICAgY29uc3QgdXJsUGFyc2VyUmVzdWx0ID0gbmV3IFVSTChpbnB1dEZvclVybFBhcnNlcik7XG4gICAgY29uc3QgaG9zdCA9IG5ldyBIb3N0KHVybFBhcnNlclJlc3VsdC5ob3N0bmFtZSk7XG4gICAgY29uc3QgcG9ydCA9IG5ldyBQb3J0KHVybFBhcnNlclJlc3VsdC5wb3J0KTtcbiAgICBjb25zdCB0YWcgPSBuZXcgVGFnKGRlY29kZVVSSUNvbXBvbmVudCh1cmxQYXJzZXJSZXN1bHQuaGFzaC5zdWJzdHJpbmcoMSkpKTtcbiAgICBjb25zdCBiNjRFbmNvZGVkVXNlckluZm8gPSB1cmxQYXJzZXJSZXN1bHQudXNlcm5hbWUucmVwbGFjZSgvJTNEL2csICc9Jyk7XG4gICAgLy8gYmFzZTY0LmRlY29kZSB0aHJvd3MgYXMgZGVzaXJlZCB3aGVuIGdpdmVuIGludmFsaWQgYmFzZTY0IGlucHV0LlxuICAgIGNvbnN0IGI2NERlY29kZWRVc2VySW5mbyA9IGI2NERlY29kZShiNjRFbmNvZGVkVXNlckluZm8pO1xuICAgIGNvbnN0IGNvbG9uSWR4ID0gYjY0RGVjb2RlZFVzZXJJbmZvLmluZGV4T2YoJzonKTtcbiAgICBpZiAoY29sb25JZHggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBNaXNzaW5nIHBhc3N3b3JkIHBhcnQ6ICR7YjY0RGVjb2RlZFVzZXJJbmZvfWApO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2RTdHJpbmcgPSBiNjREZWNvZGVkVXNlckluZm8uc3Vic3RyaW5nKDAsIGNvbG9uSWR4KTtcbiAgICBjb25zdCBtZXRob2QgPSBuZXcgTWV0aG9kKG1ldGhvZFN0cmluZyk7XG4gICAgY29uc3QgcGFzc3dvcmRTdHJpbmcgPSBiNjREZWNvZGVkVXNlckluZm8uc3Vic3RyaW5nKGNvbG9uSWR4ICsgMSk7XG4gICAgY29uc3QgcGFzc3dvcmQgPSBuZXcgUGFzc3dvcmQocGFzc3dvcmRTdHJpbmcpO1xuICAgIGxldCBwbHVnaW46IFNpcDAwM1BsdWdpbjtcbiAgICBpZiAodXJsUGFyc2VyUmVzdWx0LnNlYXJjaFBhcmFtcykge1xuICAgICAgY29uc3QgcGx1Z2luU3RyaW5nID0gdXJsUGFyc2VyUmVzdWx0LnNlYXJjaFBhcmFtcy5nZXQoJ3BsdWdpbicpO1xuICAgICAgcGx1Z2luID0gcGx1Z2luU3RyaW5nID8gbmV3IFNpcDAwM1BsdWdpbihwbHVnaW5TdHJpbmcpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNpcDAwMlVSSSh7IG1ldGhvZCwgcGFzc3dvcmQsIGhvc3QsIHBvcnQsIHRhZywgcGx1Z2luIH0gYXMgU2lwMDAyVVJJKTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IHsgYjY0RW5jb2RlZFVzZXJJbmZvLCBob3N0LCBwb3J0LCBwbHVnaW4sIHRhZyB9ID0gdGhpcztcbiAgICBjb25zdCBxdWVyeVN0cmluZyA9IHBsdWdpbiA/IGA/cGx1Z2luPSR7cGx1Z2lufWAgOiAnJztcbiAgICBjb25zdCBoYXNoID0gU2hhZG93c29ja3NVUkkuZ2V0SGFzaCh0aGlzKTtcbiAgICByZXR1cm4gYHNzOi8vJHtiNjRFbmNvZGVkVXNlckluZm99QCR7aG9zdH06JHtwb3J0fS8ke3F1ZXJ5U3RyaW5nfSR7aGFzaH1gO1xuICB9XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0c1xufSJdfQ==
