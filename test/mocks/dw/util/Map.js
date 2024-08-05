'use strict';

/* eslint-disable no-restricted-syntax */

const DwSet = require('./Set');
const MapEntry = require('./MapEntry');

class DwMap {
  constructor() {
    Object.defineProperties(this, {
      map: {
        value: new Map()
      },
      empty: {
        get() {
          return Boolean(this.map.size);
        }
      },
      length: {
        get() {
          return this.map.size;
        }
      },
    });
  }

  clear() {
    this.map.clear();
  }

  containsKey(key) {
    return this.map.has(key);
  }

  containsValue(value) {
    const values = Array.from(this.map.values());
    return values.some(v => v === value);
  }

  entrySet() {
    const set = new DwSet();

    for (const [key, value] of this.map.entries()) {
      const mapEntry = new MapEntry();
      mapEntry.key = key;
      mapEntry.value = value;
      set.add(mapEntry);
    }

    return set;
  }

  get(key) {
    return this.map.get(key);
  }

  get(key) {
    const value = this.map.get(key);
    return value === undefined ? null : value;
  }

  getLength() {
    return this.length;
  }

  isEmpty() {
    return this.empty;
  }

  keySet() {
    const set = new DwSet();

    for (const key of this.map.keys()) {
      set.add(key);
    }

    return set;
  }

  put(key, value) {
    const prev = this.get(key);
    this.map.set(key, value);
    return prev;
  }

  putAll(other) {
    for (const [key, value] of other.map.entries()) {
      this.map.set(key, value);
    }
  }

  remove(key) {
    const prev = this.get(key);
    this.map.delete(key);
    return prev;
  }

  size() {
    return this.length;
  }
}

DwMap.EMPTY_MAP = new DwMap();

module.exports = DwMap;
