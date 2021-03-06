# ShadowsocksConfig

[![Build Status](https://travis-ci.org/uProxy/ShadowsocksConfig.svg?branch=master)](https://travis-ci.org/uProxy/ShadowsocksConfig)

TypeScript library to store Shadowsocks configuration data
as well as (de)serialize it to/from SIP002 and legacy base64 URIs.
Node.js- and browser-friendly.

## References

- https://shadowsocks.org/en/config/quick-guide.html
- https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html

## Fields, validation, and sanitization

Some fields are validated, normalized, and/or sanitized, but not all:

- `host`
  - May be an IPv4, IPv6, or hostname.
  - IPv6 `::` shorthand is not currently supported.
  - Unicode hostnames are converted to punycode.
  - Hostnames must begin with a character in the set `[A-z0-9]`.
- `port`
  - Must be an integer from 0 to 65535.
- `method`
  - Only [these values](https://github.com/uProxy/ShadowsocksConfig/blob/e33a9dc/shadowsocks_config.ts#L84-L103) 
    are accepted.
- `tag` <sup>\*</sup>
  - Only URI encoded/decoded.
- `password` <sup>\*</sup>
- `extra` <sup>\*</sup>
  - Any additional configuration (e.g. `timeout`, SIP003 `plugin`, etc.) may be stored here.

\* **No sanitization is performed for these fields.**
**Client code is responsible for sanitizing these values when received from untrusted input.**

## Usage

Please see [test/unit/shadowsocks_config.spec.ts](test/unit/shadowsocks_config.spec.ts)
for example usage.

## Development

First [install yarn](https://yarnpkg.com/en/docs/install-ci).

The Gulpfile itself is written in TypeScript.
You can run the package script `gulp` to compile and run it on the fly:

```
yarn run gulp
```

### Unit Tests

```
yarn run test
```

### TypeScript Linting

```
yarn run gulp tslint
```
