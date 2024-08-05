'use strict';

/* eslint-disable class-methods-use-this */

class Cache {
  constructor(store = {}) {
    Object.defineProperty(this, 'store', {
      value: store
    });
  }

  get(key, callback) {
    if (!(key in this.store)) {
      this.store[key] = callback ? callback() : undefined;
    }

    return this.store[key];
  }

  invalidate(key) {
    delete this.store[key];
  }

  put(key, value) {
    this.store[key] = value;
  }
}

module.exports = Cache;
