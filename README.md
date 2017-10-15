# ShadowSocksConfig

This library abstracts parsing, validation and user presentation of ShadowSocks configuration URLs. It is written in TypeScript and can be imported as WebCompoment, referenced directly from the browser or used as CommonJS node module.

### WebComponent

```html
<link rel="import" href="../node_modules/ShadowSocksConfig/shadow-socks-config.html">
<shadow-socks-config>
  <div>
    <ul>
      <li>[[base64Url]]</li>
      <li>[[sip002Url]]</li>
    </ul>
    <qr-code>
  </div>
</shadow-socks-config>
```

### Common JS (Node)

```javascript
const ShadowSocksConfig = require('ShadowSocksConfig');
ShadowSocksConfig.parseURL('ss://')
```

### TypeScript

```html
/// <reference path="../node_modules/ShadowSocksConfig/ShadowSocksConfig.ts" />
```

```javascript
import { ShadowSocksURI } from 'ShadowSocksConfig';
```

## Development

The Gulpfile itself is written in TypeScript. You can run the npm script gulp to compile it on the fly:

```sh
npm run gulp
```

### Unit Tests

```sh
npm run gulp test
```
