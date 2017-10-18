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
var ConfigField = (function () {
    function ConfigField(data) {
        this.data = data;
    }
    ConfigField.prototype.toString = function () {
        return this.data.toString();
    };
    ConfigField.prototype.throwErrorForInvalidField = function (value) {
        var name = this.constructor.name;
        throw new ShadowsocksConfigError("Invalid " + name + ": " + value);
    };
    return ConfigField;
}());
exports.ConfigField = ConfigField;
var Host = (function (_super) {
    __extends(Host, _super);
    function Host(host) {
        var _this = this;
        if (host instanceof Host) {
            host = host.data;
        }
        try {
            var urlParserResult = new URL("http://" + host + "/");
            _this = _super.call(this, urlParserResult.hostname) || this;
        }
        catch (_) {
            _this.throwErrorForInvalidField(host);
        }
        return _this;
    }
    return Host;
}(ConfigField));
exports.Host = Host;
var Port = (function (_super) {
    __extends(Port, _super);
    function Port(port) {
        var _this = this;
        if (port instanceof Port) {
            port = port.data;
        }
        var throwError = function () { return _this.throwErrorForInvalidField(port); };
        if (port === '')
            throwError();
        try {
            var urlParserResult = new URL("http://0.0.0.0:" + port + "/");
            _this = _super.call(this, urlParserResult.port) || this;
        }
        catch (_) {
            throwError();
        }
        return _this;
    }
    return Port;
}(ConfigField));
exports.Port = Port;
var Method = (function (_super) {
    __extends(Method, _super);
    function Method(method) {
        var _this = this;
        if (method instanceof Method) {
            method = method.data;
        }
        _this = _super.call(this, method) || this;
        if (!Method.METHODS.has(method)) {
            _this.throwErrorForInvalidField(method);
        }
        return _this;
    }
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
        'chacha20-ietf',
    ]);
    return Method;
}(ConfigField));
exports.Method = Method;
var Password = (function (_super) {
    __extends(Password, _super);
    function Password(password) {
        return _super.call(this, password instanceof Password ? password.data : password) || this;
    }
    return Password;
}(ConfigField));
exports.Password = Password;
var Tag = (function (_super) {
    __extends(Tag, _super);
    function Tag(tag) {
        return _super.call(this, tag instanceof Tag ? tag.data : tag) || this;
    }
    return Tag;
}(ConfigField));
exports.Tag = Tag;
var Plugin = (function (_super) {
    __extends(Plugin, _super);
    function Plugin(plugin) {
        return _super.call(this, plugin instanceof Plugin ? plugin.data : plugin) || this;
    }
    return Plugin;
}(ConfigField));
exports.Plugin = Plugin;
var ValidatingShadowsocksConfig = (function () {
    function ValidatingShadowsocksConfig(config) {
        if (config.host) {
            this.host = config.host;
        }
        if (config.port) {
            this.port = config.port;
        }
        if (config.method) {
            this.method = config.method;
        }
        if (config.password) {
            this.password = config.password;
        }
        if (config.tag) {
            this.tag = config.tag;
        }
    }
    Object.defineProperty(ValidatingShadowsocksConfig.prototype, "host", {
        get: function () {
            return this.host_.toString();
        },
        set: function (host) {
            this.host_ = new Host(host);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidatingShadowsocksConfig.prototype, "port", {
        get: function () {
            return this.port_.toString();
        },
        set: function (port) {
            this.port_ = new Port(port);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidatingShadowsocksConfig.prototype, "method", {
        get: function () {
            return this.method_.toString();
        },
        set: function (method) {
            this.method_ = new Method(method);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidatingShadowsocksConfig.prototype, "password", {
        get: function () {
            return this.password_.toString();
        },
        set: function (password) {
            this.password_ = new Password(password);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidatingShadowsocksConfig.prototype, "tag", {
        get: function () {
            return this.tag_.toString();
        },
        set: function (tag) {
            this.tag_ = new Tag(tag);
        },
        enumerable: true,
        configurable: true
    });
    return ValidatingShadowsocksConfig;
}());
exports.ValidatingShadowsocksConfig = ValidatingShadowsocksConfig;
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
        var tag = config.tag instanceof Tag ? config.tag.data : config.tag;
        return tag ? "#" + encodeURIComponent(tag) : '';
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
}(ValidatingShadowsocksConfig));
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
    Object.defineProperty(Sip002URI.prototype, "plugin", {
        get: function () {
            return this.plugin_ && this.plugin_.toString();
        },
        set: function (plugin) {
            this.plugin_ = new Plugin(plugin);
        },
        enumerable: true,
        configurable: true
    });
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
            plugin = pluginString ? new Plugin(pluginString) : undefined;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFPLE1BQU0sS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDcEQsTUFBTSxDQUFDLE9BQU8sQ0FBQTtBQUNoQixDQUFDIiwiZmlsZSI6IlNoYWRvd3NvY2tzQ29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuZGVjbGFyZSB2YXIgaXNOb2RlOiBib29sZWFuO1xuXG5jb25zdCBiNjRFbmNvZGUgPSBpc05vZGUgPyByZXF1aXJlKCdiYXNlLTY0JykuZW5jb2RlIDogYnRvYTtcbmNvbnN0IGI2NERlY29kZSA9IGlzTm9kZSA/IHJlcXVpcmUoJ2Jhc2UtNjQnKS5kZWNvZGUgOiBhdG9iO1xuY29uc3QgVVJMID0gaXNOb2RlID8gcmVxdWlyZSgndXJsJykuVVJMIDogd2luZG93LlVSTDtcblxuLy8gQ3VzdG9tIGVycm9yc1xuZXhwb3J0IGNsYXNzIFNoYWRvd3NvY2tzQ29uZmlnRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpOyAgLy8gJ0Vycm9yJyBicmVha3MgcHJvdG90eXBlIGNoYWluIGhlcmUgaWYgdGhpcyBpcyB0cmFuc3BpbGVkIHRvIGVzNVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBuZXcudGFyZ2V0LnByb3RvdHlwZSk7ICAvLyByZXN0b3JlIHByb3RvdHlwZSBjaGFpblxuICAgIHRoaXMubmFtZSA9IG5ldy50YXJnZXQubmFtZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZFNoYWRvd3NvY2tzVVJJIGV4dGVuZHMgU2hhZG93c29ja3NDb25maWdFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuLy8gRW5kIGN1c3RvbSBlcnJvcnNcblxuXG4vLyBTZWxmLXZhbGlkYXRpbmcvbm9ybWFsaXppbmcgY29uZmlnIGRhdGEgdHlwZXMgc3ViY2xhc3MgdGhpcyBDb25maWdGaWVsZCBjbGFzcy5cbi8vIENvbnN0cnVjdG9ycyB0YWtlIGEgc3RyaW5nLCB2YWxpZGF0ZS9ub3JtYWxpemUvYWNjZXB0IGlmIHZhbGlkLCBvciB0aHJvdyBvdGhlcndpc2UuXG4vLyBTb21lIGV4YW1wbGVzIChQb3J0IGlzIGEgQ29uZmlnRmllbGQgc3ViY2xhc3MsIHNlZSBiZWxvdyk6XG4vLyAgIG5ldyBQb3J0KCcnKSAgICAgICAgICAgLT4gdGhyb3dzXG4vLyAgIG5ldyBQb3J0KCdub3QgYSBwb3J0JykgLT4gdGhyb3dzXG4vLyAgIG5ldyBQb3J0KCctMTIzJykgICAgICAgLT4gdGhyb3dzXG4vLyAgIG5ldyBQb3J0KCcxMjMuNCcpICAgICAgLT4gdGhyb3dzXG4vLyAgIG5ldyBQb3J0KCcwMTIzNCcpICAgICAgLT4gJzEyMzQnXG5leHBvcnQgY2xhc3MgQ29uZmlnRmllbGQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgZGF0YTogc3RyaW5nKSB7fVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB0aHJvd0Vycm9yRm9ySW52YWxpZEZpZWxkKHZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHRocm93IG5ldyBTaGFkb3dzb2Nrc0NvbmZpZ0Vycm9yKGBJbnZhbGlkICR7bmFtZX06ICR7dmFsdWV9YCk7XG4gIH1cbn1cblxuLy8gSG9zdCBhbmQgUG9ydCB2YWxpZGF0aW9uL25vcm1hbGl6YXRpb24gYXJlIGJ1aWx0IG9uIHRvcCBvZiBVUkwgZm9yIHNhZmV0eSBhbmQgZWZmaWNpZW5jeS5cbmV4cG9ydCBjbGFzcyBIb3N0IGV4dGVuZHMgQ29uZmlnRmllbGQge1xuICBjb25zdHJ1Y3Rvcihob3N0OiBIb3N0IHwgc3RyaW5nKSB7XG4gICAgaWYgKGhvc3QgaW5zdGFuY2VvZiBIb3N0KSB7XG4gICAgICBob3N0ID0gaG9zdC5kYXRhO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsUGFyc2VyUmVzdWx0ID0gbmV3IFVSTChgaHR0cDovLyR7aG9zdH0vYCk7XG4gICAgICBzdXBlcih1cmxQYXJzZXJSZXN1bHQuaG9zdG5hbWUpO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHRoaXMudGhyb3dFcnJvckZvckludmFsaWRGaWVsZChob3N0KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gTk9URTogUG9ydCBkYXRhIGlzIHN0b3JlZCBhcyBhIHN0cmluZywgbm90IGEgbnVtYmVyLCBhcyBpbiBhIFVSTCBpbnN0YW5jZS5cbmV4cG9ydCBjbGFzcyBQb3J0IGV4dGVuZHMgQ29uZmlnRmllbGQge1xuICBjb25zdHJ1Y3Rvcihwb3J0OiBQb3J0IHwgc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgaWYgKHBvcnQgaW5zdGFuY2VvZiBQb3J0KSB7XG4gICAgICBwb3J0ID0gcG9ydC5kYXRhO1xuICAgIH1cbiAgICBjb25zdCB0aHJvd0Vycm9yID0gKCkgPT4gdGhpcy50aHJvd0Vycm9yRm9ySW52YWxpZEZpZWxkKHBvcnQpO1xuICAgIGlmIChwb3J0ID09PSAnJykgdGhyb3dFcnJvcigpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1cmxQYXJzZXJSZXN1bHQgPSBuZXcgVVJMKGBodHRwOi8vMC4wLjAuMDoke3BvcnR9L2ApO1xuICAgICAgc3VwZXIodXJsUGFyc2VyUmVzdWx0LnBvcnQpO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQSBtZXRob2QgdmFsdWUgbXVzdCBleGFjdGx5IG1hdGNoIGFuIGVsZW1lbnQgaW4gdGhlIHNldCBvZiBrbm93biBjaXBoZXJzLlxuLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2hhZG93c29ja3Mvc2hhZG93c29ja3MtbGliZXYvYmxvYi8xMGEyZDNlMy9jb21wbGV0aW9ucy9iYXNoL3NzLXJlZGlyI0w1XG5leHBvcnQgY2xhc3MgTWV0aG9kIGV4dGVuZHMgQ29uZmlnRmllbGQge1xuICBwcml2YXRlIHN0YXRpYyBNRVRIT0RTID0gbmV3IFNldChbXG4gICAgJ3JjNC1tZDUnLFxuICAgICdhZXMtMTI4LWdjbScsXG4gICAgJ2Flcy0xOTItZ2NtJyxcbiAgICAnYWVzLTI1Ni1nY20nLFxuICAgICdhZXMtMTI4LWNmYicsXG4gICAgJ2Flcy0xOTItY2ZiJyxcbiAgICAnYWVzLTI1Ni1jZmInLFxuICAgICdhZXMtMTI4LWN0cicsXG4gICAgJ2Flcy0xOTItY3RyJyxcbiAgICAnYWVzLTI1Ni1jdHInLFxuICAgICdjYW1lbGxpYS0xMjgtY2ZiJyxcbiAgICAnY2FtZWxsaWEtMTkyLWNmYicsXG4gICAgJ2NhbWVsbGlhLTI1Ni1jZmInLFxuICAgICdiZi1jZmInLFxuICAgICdjaGFjaGEyMC1pZXRmLXBvbHkxMzA1JyxcbiAgICAnc2Fsc2EyMCcsXG4gICAgJ2NoYWNoYTIwJyxcbiAgICAnY2hhY2hhMjAtaWV0ZicsXG4gICBdKTtcblxuICBjb25zdHJ1Y3RvcihtZXRob2Q6IE1ldGhvZCB8IHN0cmluZykge1xuICAgIGlmIChtZXRob2QgaW5zdGFuY2VvZiBNZXRob2QpIHtcbiAgICAgIG1ldGhvZCA9IG1ldGhvZC5kYXRhO1xuICAgIH1cbiAgICBzdXBlcihtZXRob2QpO1xuICAgIGlmICghTWV0aG9kLk1FVEhPRFMuaGFzKG1ldGhvZCkpIHtcbiAgICAgIHRoaXMudGhyb3dFcnJvckZvckludmFsaWRGaWVsZChtZXRob2QpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBDdXJyZW50bHkgbm8gdmFsaWRhdGlvbiBpcyBwZXJmb3JtZWQgZm9yIFBhc3N3b3JkLCBUYWcsIG9yIFBsdWdpbi5cbi8vIENsaWVudCBjb2RlIGlzIHJlc3BvbnNpYmxlIGZvciB2YWxpZGF0aW5nIGFuZCBzYW5pdGl6aW5nIHRoZXNlIHdoZW4gdXNpbmcgd2l0aCB1bnRydXN0ZWQgaW5wdXQuXG4vLyBUT0RPOiBEb2N1bWVudCB0aGlzIGluIHRoZSBSRUFETUUuXG5leHBvcnQgY2xhc3MgUGFzc3dvcmQgZXh0ZW5kcyBDb25maWdGaWVsZCB7XG4gIGNvbnN0cnVjdG9yKHBhc3N3b3JkOiBQYXNzd29yZCB8IHN0cmluZykge1xuICAgIHN1cGVyKHBhc3N3b3JkIGluc3RhbmNlb2YgUGFzc3dvcmQgPyBwYXNzd29yZC5kYXRhIDogcGFzc3dvcmQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUYWcgZXh0ZW5kcyBDb25maWdGaWVsZCB7XG4gIGNvbnN0cnVjdG9yKHRhZzogVGFnIHwgc3RyaW5nKSB7XG4gICAgc3VwZXIodGFnIGluc3RhbmNlb2YgVGFnID8gdGFnLmRhdGEgOiB0YWcpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQbHVnaW4gZXh0ZW5kcyBDb25maWdGaWVsZCB7XG4gIGNvbnN0cnVjdG9yKHBsdWdpbjogUGx1Z2luIHwgc3RyaW5nKSB7XG4gICAgc3VwZXIocGx1Z2luIGluc3RhbmNlb2YgUGx1Z2luID8gcGx1Z2luLmRhdGEgOiBwbHVnaW4pO1xuICB9XG59XG4vLyBFbmQgQ29uZmlnRmllbGQgdHlwZXMuXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hhZG93c29ja3NDb25maWcge1xuICBob3N0PzogSG9zdCB8IHN0cmluZztcbiAgcG9ydD86IFBvcnQgfCBzdHJpbmcgfCBudW1iZXI7XG4gIG1ldGhvZD86IE1ldGhvZCB8IHN0cmluZztcbiAgcGFzc3dvcmQ/OiBQYXNzd29yZCB8IHN0cmluZztcbiAgdGFnPzogVGFnIHwgc3RyaW5nO1xuICBwbHVnaW4/OiBQbHVnaW4gfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBWYWxpZGF0aW5nU2hhZG93c29ja3NDb25maWcgaW1wbGVtZW50cyBTaGFkb3dzb2Nrc0NvbmZpZyB7XG4gIHByaXZhdGUgaG9zdF8/OiBIb3N0O1xuICBwcml2YXRlIHBvcnRfPzogUG9ydDtcbiAgcHJpdmF0ZSBtZXRob2RfPzogTWV0aG9kO1xuICBwcml2YXRlIHBhc3N3b3JkXz86IFBhc3N3b3JkO1xuICBwcml2YXRlIHRhZ18/OiBUYWc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBTaGFkb3dzb2Nrc0NvbmZpZyB8IFZhbGlkYXRpbmdTaGFkb3dzb2Nrc0NvbmZpZykge1xuICAgIGlmIChjb25maWcuaG9zdCkge1xuICAgICAgdGhpcy5ob3N0ID0gY29uZmlnLmhvc3Q7XG4gICAgfVxuICAgIGlmIChjb25maWcucG9ydCkge1xuICAgICAgdGhpcy5wb3J0ID0gY29uZmlnLnBvcnQ7XG4gICAgfVxuICAgIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgICB0aGlzLm1ldGhvZCA9IGNvbmZpZy5tZXRob2Q7XG4gICAgfVxuICAgIGlmIChjb25maWcucGFzc3dvcmQpIHtcbiAgICAgIHRoaXMucGFzc3dvcmQgPSBjb25maWcucGFzc3dvcmQ7XG4gICAgfVxuICAgIGlmIChjb25maWcudGFnKSB7XG4gICAgICB0aGlzLnRhZyA9IGNvbmZpZy50YWc7XG4gICAgfVxuICB9XG5cbiAgc2V0IGhvc3QoaG9zdDogSG9zdCB8IHN0cmluZykge1xuICAgIHRoaXMuaG9zdF8gPSBuZXcgSG9zdChob3N0KTtcbiAgfVxuXG4gIHNldCBwb3J0KHBvcnQ6IFBvcnQgfCBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICB0aGlzLnBvcnRfID0gbmV3IFBvcnQocG9ydCk7XG4gIH1cblxuICBzZXQgbWV0aG9kKG1ldGhvZDogTWV0aG9kIHwgc3RyaW5nKSB7XG4gICAgdGhpcy5tZXRob2RfID0gbmV3IE1ldGhvZChtZXRob2QpO1xuICB9XG5cbiAgc2V0IHBhc3N3b3JkKHBhc3N3b3JkOiBQYXNzd29yZCB8IHN0cmluZykge1xuICAgIHRoaXMucGFzc3dvcmRfID0gbmV3IFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgfVxuXG4gIHNldCB0YWcodGFnOiBUYWcgfCBzdHJpbmcpIHtcbiAgICB0aGlzLnRhZ18gPSBuZXcgVGFnKHRhZyk7XG4gIH1cblxuICBnZXQgaG9zdCgpIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0Xy50b1N0cmluZygpO1xuICB9XG5cbiAgZ2V0IHBvcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9ydF8udG9TdHJpbmcoKTtcbiAgfVxuXG4gIGdldCBtZXRob2QoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kXy50b1N0cmluZygpO1xuICB9XG5cbiAgZ2V0IHBhc3N3b3JkKCkge1xuICAgIHJldHVybiB0aGlzLnBhc3N3b3JkXy50b1N0cmluZygpO1xuICB9XG5cbiAgZ2V0IHRhZygpIHtcbiAgICByZXR1cm4gdGhpcy50YWdfLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNoYWRvd3NvY2tzVVJJIGV4dGVuZHMgVmFsaWRhdGluZ1NoYWRvd3NvY2tzQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnOiBTaGFkb3dzb2Nrc0NvbmZpZyB8IFZhbGlkYXRpbmdTaGFkb3dzb2Nrc0NvbmZpZykge1xuICAgIHN1cGVyKGNvbmZpZyk7XG4gIH1cblxuICBhYnN0cmFjdCB0b1N0cmluZygpOiBzdHJpbmc7XG5cbiAgc3RhdGljIHZhbGlkYXRlUHJvdG9jb2wodXJpOiBzdHJpbmcpIHtcbiAgICBpZiAoIXVyaS5zdGFydHNXaXRoKCdzczovLycpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBVUkkgbXVzdCBzdGFydCB3aXRoIFwic3M6Ly9cIjogJHt1cml9YCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldEhhc2goY29uZmlnOiBTaGFkb3dzb2Nrc0NvbmZpZyB8IFZhbGlkYXRpbmdTaGFkb3dzb2Nrc0NvbmZpZykge1xuICAgIGNvbnN0IHRhZyA9IGNvbmZpZy50YWcgaW5zdGFuY2VvZiBUYWcgPyBjb25maWcudGFnLmRhdGEgOiBjb25maWcudGFnO1xuICAgIHJldHVybiB0YWcgPyBgIyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRhZyl9YCA6ICcnO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlKHVyaTogc3RyaW5nKTogU2hhZG93c29ja3NDb25maWcge1xuICAgIGxldCBlcnJvcjogRXJyb3I7XG4gICAgZm9yIChjb25zdCBVcmlUeXBlIG9mIFtMZWdhY3lCYXNlNjRVUkksIFNpcDAwMlVSSV0pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBVcmlUeXBlLnBhcnNlKHVyaSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yID0gZXJyb3IgfHwgZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkU2hhZG93c29ja3NVUkkpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbEVycm9yTmFtZSA9IChlcnJvciBhcyBFcnJvcikubmFtZSB8fCAnKFVubmFtZWQgRXJyb3IpJztcbiAgICAgIGNvbnN0IG9yaWdpbmFsRXJyb3JNZXNzYWdlID0gKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlIHx8ICcobm8gZXJyb3IgbWVzc2FnZSBwcm92aWRlZCknO1xuICAgICAgY29uc3Qgb3JpZ2luYWxFcnJvclN0cmluZyA9IGAke29yaWdpbmFsRXJyb3JOYW1lfTogJHtvcmlnaW5hbEVycm9yTWVzc2FnZX1gO1xuICAgICAgY29uc3QgbmV3RXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6ICR7dXJpfSAtIE9yaWdpbmFsIGVycm9yOiAke29yaWdpbmFsRXJyb3JTdHJpbmd9YDtcbiAgICAgIGVycm9yID0gbmV3IEludmFsaWRTaGFkb3dzb2Nrc1VSSShuZXdFcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vLyBSZWY6IGh0dHBzOi8vc2hhZG93c29ja3Mub3JnL2VuL2NvbmZpZy9xdWljay1ndWlkZS5odG1sXG5leHBvcnQgY2xhc3MgTGVnYWN5QmFzZTY0VVJJIGV4dGVuZHMgU2hhZG93c29ja3NVUkkge1xuICBiNjRFbmNvZGVkRGF0YTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU2hhZG93c29ja3NDb25maWcgfCBWYWxpZGF0aW5nU2hhZG93c29ja3NDb25maWcpIHtcbiAgICBzdXBlcihjb25maWcpO1xuICAgIGNvbnN0IHsgbWV0aG9kLCBwYXNzd29yZCwgaG9zdCwgcG9ydCB9ID0gdGhpcztcbiAgICBjb25zdCBiNjRFbmNvZGVkRGF0YSA9IGI2NEVuY29kZShgJHttZXRob2R9OiR7cGFzc3dvcmR9QCR7aG9zdH06JHtwb3J0fWApO1xuICAgIGNvbnN0IGRhdGFMZW5ndGggPSBiNjRFbmNvZGVkRGF0YS5sZW5ndGg7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSAwO1xuICAgIGZvciAoOyBiNjRFbmNvZGVkRGF0YVtkYXRhTGVuZ3RoIC0gMSAtIHBhZGRpbmdMZW5ndGhdID09PSAnPSc7IHBhZGRpbmdMZW5ndGgrKyk7XG4gICAgdGhpcy5iNjRFbmNvZGVkRGF0YSA9IHBhZGRpbmdMZW5ndGggPT09IDAgPyBiNjRFbmNvZGVkRGF0YSA6XG4gICAgICAgIGI2NEVuY29kZWREYXRhLnN1YnN0cmluZygwLCBkYXRhTGVuZ3RoIC0gcGFkZGluZ0xlbmd0aCk7XG4gIH1cblxuICBzdGF0aWMgcGFyc2UodXJpOiBzdHJpbmcpIHtcbiAgICBTaGFkb3dzb2Nrc1VSSS52YWxpZGF0ZVByb3RvY29sKHVyaSk7XG4gICAgY29uc3QgaGFzaEluZGV4ID0gdXJpLmluZGV4T2YoJyMnKTtcbiAgICBsZXQgYjY0RW5kSW5kZXggPSBoYXNoSW5kZXg7XG4gICAgbGV0IHRhZ1N0YXJ0SW5kZXggPSBoYXNoSW5kZXggKyAxO1xuICAgIGlmIChoYXNoSW5kZXggPT09IC0xKSB7XG4gICAgICBiNjRFbmRJbmRleCA9IHRhZ1N0YXJ0SW5kZXggPSB1cmkubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCB0YWcgPSBuZXcgVGFnKGRlY29kZVVSSUNvbXBvbmVudCh1cmkuc3Vic3RyaW5nKHRhZ1N0YXJ0SW5kZXgpKSk7XG4gICAgY29uc3QgYjY0RW5jb2RlZERhdGEgPSB1cmkuc3Vic3RyaW5nKCdzczovLycubGVuZ3RoLCBiNjRFbmRJbmRleCk7XG4gICAgY29uc3QgYjY0RGVjb2RlZERhdGEgPSBiNjREZWNvZGUoYjY0RW5jb2RlZERhdGEpO1xuICAgIGNvbnN0IGF0U2lnbkluZGV4ID0gYjY0RGVjb2RlZERhdGEuaW5kZXhPZignQCcpO1xuICAgIGlmIChhdFNpZ25JbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkU2hhZG93c29ja3NVUkkoYE1pc3NpbmcgXCJAXCI6ICR7YjY0RGVjb2RlZERhdGF9YCk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZEFuZFBhc3N3b3JkID0gYjY0RGVjb2RlZERhdGEuc3Vic3RyaW5nKDAsIGF0U2lnbkluZGV4KTtcbiAgICBjb25zdCBtZXRob2RFbmRJbmRleCA9IG1ldGhvZEFuZFBhc3N3b3JkLmluZGV4T2YoJzonKTtcbiAgICBpZiAobWV0aG9kRW5kSW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBNaXNzaW5nIHBhc3N3b3JkIHBhcnQ6ICR7bWV0aG9kQW5kUGFzc3dvcmR9YCk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZFN0cmluZyA9IG1ldGhvZEFuZFBhc3N3b3JkLnN1YnN0cmluZygwLCBtZXRob2RFbmRJbmRleCk7XG4gICAgY29uc3QgbWV0aG9kID0gbmV3IE1ldGhvZChtZXRob2RTdHJpbmcpO1xuICAgIGNvbnN0IHBhc3N3b3JkU3RhcnRJbmRleCA9IG1ldGhvZEVuZEluZGV4ICsgMTtcbiAgICBjb25zdCBwYXNzd29yZFN0cmluZyA9IG1ldGhvZEFuZFBhc3N3b3JkLnN1YnN0cmluZyhwYXNzd29yZFN0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IHBhc3N3b3JkID0gbmV3IFBhc3N3b3JkKHBhc3N3b3JkU3RyaW5nKTtcbiAgICBjb25zdCBob3N0U3RhcnRJbmRleCA9IGF0U2lnbkluZGV4ICsgMTtcbiAgICBjb25zdCBob3N0QW5kUG9ydCA9IGI2NERlY29kZWREYXRhLnN1YnN0cmluZyhob3N0U3RhcnRJbmRleCk7XG4gICAgY29uc3QgaG9zdEVuZEluZGV4ID0gaG9zdEFuZFBvcnQuaW5kZXhPZignOicpO1xuICAgIGlmIChob3N0RW5kSW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFNoYWRvd3NvY2tzVVJJKGBNaXNzaW5nIHBvcnQgcGFydDogJHtob3N0QW5kUG9ydH1gKTtcbiAgICB9XG4gICAgY29uc3QgaG9zdCA9IG5ldyBIb3N0KGhvc3RBbmRQb3J0LnN1YnN0cmluZygwLCBob3N0RW5kSW5kZXgpKTtcbiAgICBjb25zdCBwb3J0U3RhcnRJbmRleCA9IGhvc3RFbmRJbmRleCArIDE7XG4gICAgY29uc3QgcG9ydFN0cmluZyA9IGhvc3RBbmRQb3J0LnN1YnN0cmluZyhwb3J0U3RhcnRJbmRleCk7XG4gICAgY29uc3QgcG9ydCA9IG5ldyBQb3J0KHBvcnRTdHJpbmcpO1xuICAgIHJldHVybiBuZXcgTGVnYWN5QmFzZTY0VVJJKHsgbWV0aG9kLCBwYXNzd29yZCwgaG9zdCwgcG9ydCwgdGFnIH0pO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgeyBiNjRFbmNvZGVkRGF0YSwgdGFnIH0gPSB0aGlzO1xuICAgIGNvbnN0IGhhc2ggPSBTaGFkb3dzb2Nrc1VSSS5nZXRIYXNoKHRoaXMpO1xuICAgIHJldHVybiBgc3M6Ly8ke2I2NEVuY29kZWREYXRhfSR7aGFzaH1gO1xuICB9XG59XG5cbi8vIFJlZjogaHR0cHM6Ly9zaGFkb3dzb2Nrcy5vcmcvZW4vc3BlYy9TSVAwMDItVVJJLVNjaGVtZS5odG1sXG4vLyBOT1RFOiBDdXJyZW50bHkgdGhlIHBsdWdpbiBxdWVyeSBwYXJhbSBpcyBwcmVzZXJ2ZWQgb24gYSBiZXN0LWVmZm9ydCBiYXNpcy4gSXQgaXMgc2lsZW50bHlcbi8vICAgICAgIGRyb3BwZWQgb24gcGxhdGZvcm1zIHRoYXQgZG8gbm90IHN1cHBvcnQgdGhlIGZ1bGwgd2hhdHdnIFVSTCBzdGFuZGFyZCAoY2YuIGBzZWFyY2hQYXJhbXNgKS5cbi8vICAgICAgIFJlZjpcbi8vICAgICAgICAgLSBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybC1jbGFzc1xuLy8gICAgICAgICAtIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9dXJsc2VhcmNocGFyYW1zXG5leHBvcnQgY2xhc3MgU2lwMDAyVVJJIGV4dGVuZHMgU2hhZG93c29ja3NVUkkge1xuICBiNjRFbmNvZGVkVXNlckluZm86IHN0cmluZztcbiAgcHJpdmF0ZSBwbHVnaW5fPzogUGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU2hhZG93c29ja3NDb25maWcgfCBWYWxpZGF0aW5nU2hhZG93c29ja3NDb25maWcpIHtcbiAgICBzdXBlcihjb25maWcpO1xuICAgIGNvbnN0IHsgbWV0aG9kLCBwYXNzd29yZCB9ID0gdGhpcztcbiAgICB0aGlzLmI2NEVuY29kZWRVc2VySW5mbyA9IGI2NEVuY29kZShgJHttZXRob2R9OiR7cGFzc3dvcmR9YCk7XG4gICAgY29uc3QgcGx1Z2luID0gKGNvbmZpZyBhcyBTaXAwMDJVUkkpLnBsdWdpbjtcbiAgICBpZiAocGx1Z2luKSB7XG4gICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB9XG4gIH1cblxuICBnZXQgcGx1Z2luKCkge1xuICAgIHJldHVybiB0aGlzLnBsdWdpbl8gJiYgdGhpcy5wbHVnaW5fLnRvU3RyaW5nKCk7XG4gIH1cblxuICBzZXQgcGx1Z2luKHBsdWdpbjogUGx1Z2luIHwgc3RyaW5nKSB7XG4gICAgdGhpcy5wbHVnaW5fID0gbmV3IFBsdWdpbihwbHVnaW4pO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlKHVyaTogc3RyaW5nKSB7XG4gICAgU2hhZG93c29ja3NVUkkudmFsaWRhdGVQcm90b2NvbCh1cmkpO1xuICAgIC8vIHJlcGxhY2UgXCJzc1wiIHdpdGggXCJodHRwXCIgc28gVVJMIGJ1aWx0LWluIHBhcnNlciBwYXJzZXMgaXQgY29ycmVjdGx5LlxuICAgIGNvbnN0IGlucHV0Rm9yVXJsUGFyc2VyID0gYGh0dHAke3VyaS5zdWJzdHJpbmcoMil9YDtcbiAgICAvLyBUaGUgYnVpbHQtaW4gVVJMIHBhcnNlciB0aHJvd3MgYXMgZGVzaXJlZCB3aGVuIGdpdmVuIFVSSXMgd2l0aCBpbnZhbGlkIHN5bnRheC5cbiAgICBjb25zdCB1cmxQYXJzZXJSZXN1bHQgPSBuZXcgVVJMKGlucHV0Rm9yVXJsUGFyc2VyKTtcbiAgICBjb25zdCBob3N0ID0gbmV3IEhvc3QodXJsUGFyc2VyUmVzdWx0Lmhvc3RuYW1lKTtcbiAgICBjb25zdCBwb3J0ID0gbmV3IFBvcnQodXJsUGFyc2VyUmVzdWx0LnBvcnQpO1xuICAgIGNvbnN0IHRhZyA9IG5ldyBUYWcoZGVjb2RlVVJJQ29tcG9uZW50KHVybFBhcnNlclJlc3VsdC5oYXNoLnN1YnN0cmluZygxKSkpO1xuICAgIGNvbnN0IGI2NEVuY29kZWRVc2VySW5mbyA9IHVybFBhcnNlclJlc3VsdC51c2VybmFtZS5yZXBsYWNlKC8lM0QvZywgJz0nKTtcbiAgICAvLyBiYXNlNjQuZGVjb2RlIHRocm93cyBhcyBkZXNpcmVkIHdoZW4gZ2l2ZW4gaW52YWxpZCBiYXNlNjQgaW5wdXQuXG4gICAgY29uc3QgYjY0RGVjb2RlZFVzZXJJbmZvID0gYjY0RGVjb2RlKGI2NEVuY29kZWRVc2VySW5mbyk7XG4gICAgY29uc3QgY29sb25JZHggPSBiNjREZWNvZGVkVXNlckluZm8uaW5kZXhPZignOicpO1xuICAgIGlmIChjb2xvbklkeCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkU2hhZG93c29ja3NVUkkoYE1pc3NpbmcgcGFzc3dvcmQgcGFydDogJHtiNjREZWNvZGVkVXNlckluZm99YCk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZFN0cmluZyA9IGI2NERlY29kZWRVc2VySW5mby5zdWJzdHJpbmcoMCwgY29sb25JZHgpO1xuICAgIGNvbnN0IG1ldGhvZCA9IG5ldyBNZXRob2QobWV0aG9kU3RyaW5nKTtcbiAgICBjb25zdCBwYXNzd29yZFN0cmluZyA9IGI2NERlY29kZWRVc2VySW5mby5zdWJzdHJpbmcoY29sb25JZHggKyAxKTtcbiAgICBjb25zdCBwYXNzd29yZCA9IG5ldyBQYXNzd29yZChwYXNzd29yZFN0cmluZyk7XG4gICAgbGV0IHBsdWdpbjogUGx1Z2luO1xuICAgIGlmICh1cmxQYXJzZXJSZXN1bHQuc2VhcmNoUGFyYW1zKSB7XG4gICAgICBjb25zdCBwbHVnaW5TdHJpbmcgPSB1cmxQYXJzZXJSZXN1bHQuc2VhcmNoUGFyYW1zLmdldCgncGx1Z2luJyk7XG4gICAgICBwbHVnaW4gPSBwbHVnaW5TdHJpbmcgPyBuZXcgUGx1Z2luKHBsdWdpblN0cmluZykgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2lwMDAyVVJJKHsgbWV0aG9kLCBwYXNzd29yZCwgaG9zdCwgcG9ydCwgdGFnLCBwbHVnaW4gfSBhcyBTaXAwMDJVUkkpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgeyBiNjRFbmNvZGVkVXNlckluZm8sIGhvc3QsIHBvcnQsIHBsdWdpbiwgdGFnIH0gPSB0aGlzO1xuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcGx1Z2luID8gYD9wbHVnaW49JHtwbHVnaW59YCA6ICcnO1xuICAgIGNvbnN0IGhhc2ggPSBTaGFkb3dzb2Nrc1VSSS5nZXRIYXNoKHRoaXMpO1xuICAgIHJldHVybiBgc3M6Ly8ke2I2NEVuY29kZWRVc2VySW5mb31AJHtob3N0fToke3BvcnR9LyR7cXVlcnlTdHJpbmd9JHtoYXNofWA7XG4gIH1cbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzXG59XG4iXX0=
