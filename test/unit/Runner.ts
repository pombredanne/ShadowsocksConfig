/// <reference types="gulp" />
/// <reference types="node" />

const fs = require('fs');
const path = require('path');

export class MochaRunner {

  constructor(public dir = __dirname) {
    this.loadSpecs();
  }

  private loadSpecs(): (() => {})[] {
    return fs.readdirSync(this.dir)
      .filter((file: string) => file.endsWith('spec.js'))
      .forEach((file: string) => require(path.join(this.dir, file)));
  }
}
