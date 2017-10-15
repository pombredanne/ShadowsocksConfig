export class ShadowsocksConfigError extends Error {
  constructor(message?: string) {
    // ref: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    super(message);  // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype);  // restore prototype chain
    this.name = new.target.name;
  }
}

export class InvalidShadowsocksURI extends ShadowsocksConfigError {
  constructor(public readonly message: string) {
    super(message);
  }
}

export class AbstractMethodNotImplemented extends ShadowsocksConfigError {
  constructor() {
    super('abstract method not implemented');
  }
}
