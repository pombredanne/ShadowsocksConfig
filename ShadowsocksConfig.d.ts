export declare class ShadowsocksConfigError extends Error {
    constructor(message: string);
}
export declare class InvalidShadowsocksURI extends ShadowsocksConfigError {
    readonly message: string;
    constructor(message: string);
}
export declare class ConfigData {
    readonly data: string;
    constructor(data: string);
    toString(): string;
}
export declare class Host extends ConfigData {
    constructor(data: string);
}
export declare class Port extends ConfigData {
    constructor(data: string);
}
export declare class Method extends ConfigData {
    private static METHODS;
    constructor(data: string);
}
export declare class Password extends ConfigData {
    constructor(data: string);
}
export declare class Tag extends ConfigData {
    constructor(data: string);
}
export declare class Sip003Plugin extends ConfigData {
    constructor(data: string);
}
export declare class ShadowsocksConfig {
    host?: Host;
    port?: Port;
    method?: Method;
    password?: Password;
    tag?: Tag;
    constructor(config: ShadowsocksConfig);
}
export declare abstract class ShadowsocksURI extends ShadowsocksConfig {
    constructor(config: ShadowsocksConfig);
    abstract toString(): string;
    static validateProtocol(uri: string): void;
    static getHash(config: ShadowsocksConfig): string;
    static parse(uri: string): ShadowsocksConfig;
}
export declare class LegacyBase64URI extends ShadowsocksURI {
    b64EncodedData: string;
    constructor(config: ShadowsocksConfig);
    static parse(uri: string): LegacyBase64URI;
    toString(): string;
}
export declare class Sip002URI extends ShadowsocksURI {
    b64EncodedUserInfo: string;
    plugin?: Sip003Plugin;
    constructor(config: ShadowsocksConfig);
    static parse(uri: string): Sip002URI;
    toString(): string;
}
