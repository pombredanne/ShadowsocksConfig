/// <reference types="gulp" />
/// <reference types="node" />

const fs = require('fs');
const path = require('path');

export class MochaRunner {

  constructor(
    public dir: string = __dirname
  ) {
    this.loadSpecs();
  }

  private loadSpecs(): (() => {})[] {
    return fs.readdirSync(this.dir)
      .filter(file => file.endsWith('.spec.js'))
      .forEach(file => require(path.join(this.dir, file)));
  }

}
