'use strict';

const Cache = require('./Cache');

class CacheMgr {
  static getCache(cacheID) {
    if (!this.store[cacheID]) {
      this.store[cacheID] = new Cache();
    }

    return this.store[cacheID];
  }
}

Object.defineProperty(CacheMgr, 'store', {
  value: {}
});

module.exports = CacheMgr;
