'use strict';

class KeyRef {
  constructor(alias) {
    this.key = KeyRef.store[alias];
  }

  toString() {
    return this.key;
  }
}

KeyRef.store = {};

module.exports = KeyRef;
