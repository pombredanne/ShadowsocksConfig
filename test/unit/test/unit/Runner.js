define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require('fs');
    const path = require('path');
    class MochaRunner {
        constructor(dir = __dirname) {
            this.dir = dir;
            this.loadSpecs();
        }
        loadSpecs() {
            return fs.readdirSync(this.dir)
                .filter((file) => {
                console.log('discovered file:', file);
                return file.endsWith('spec.js');
            })
                .forEach((file) => require(path.join(this.dir, file)));
        }
    }
    exports.MochaRunner = MochaRunner;
});
