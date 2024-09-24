'use strict';

class Cache {
  constructor(store = {}) {
    this.store = store;
  }

  get(key, callback) {
    let value = this.store[key];

    if (value === undefined && typeof callback === 'function') {
      value = callback();

      if (value !== undefined) {
        this.store[key] = value;
      }
    }

    return value;
  }

  invalidate(key) {
    delete this.store[key];
  }

  put(key, value) {
    if (value === undefined) {
      this.invalidate(key);
    } else {
      this.store[key] = value;
    }
  }
}

module.exports = Cache;
