export declare type Host = string;
export declare type Port = number;
export declare type Password = string;
export declare type Timeout = number;
export declare type Tag = string;
export declare enum Method {
    RC4_MD5 = "rc4-md5",
    AES_128_GCM = "aes-128-gcm",
    AES_192_GCM = "aes-192-gcm",
    AES_256_GCM = "aes-256-gcm",
    AES_128_CFB = "aes-128-cfb",
    AES_192_CFB = "aes-192-cfb",
    AES_256_CFB = "aes-256-cfb",
    AES_128_CTR = "aes-128-ctr",
    AES_192_CTR = "aes-192-ctr",
    AES_256_CTR = "aes-256-ctr",
    CAMELLIA_128_CFB = "camellia-128-cfb",
    CAMELLIA_192_CFB = "camellia-192-cfb",
    CAMELLIA_256_CFB = "camellia-256-cfb",
    BF_CFB = "bf-cfb",
    'CHACHA20-IETF-POLY1305' = "chacha20-ietf-poly1305",
    SALSA20 = "salsa20",
    CHACHA20 = "chacha20",
    CHACHA20_IETF = "chacha20-ietf",
}
export declare class ShadowsocksConfigError extends Error {
    constructor(message?: string);
}
export declare class InvalidShadowsocksURI extends ShadowsocksConfigError {
    readonly message: string;
    constructor(message: string);
}
export declare class ShadowSocksURI {
    private type;
    method: Method;
    host: Host;
    port: Port;
    password: Password;
    timeout: Timeout;
    tag: Tag;
    constructor(data: {}, type: URIType);
    toString(): string;
}
export interface URIType {
    parse(urlString: string): ShadowSocksURI;
    toString(data: ShadowSocksURI): string;
    isValid(urlString: string): any;
}
export declare function parseURI(input: string): ShadowSocksURI;
