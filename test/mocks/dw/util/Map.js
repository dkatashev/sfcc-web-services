'use strict';

const DwSet = require('./Set');
const MapEntry = require('./MapEntry');

class DwMap {
  constructor(map = new Map()) {
    Object.defineProperties(this, {
      map: {
        value: map
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

    Array.from(this.map.entries()).forEach(([key, value]) => {
      const mapEntry = new MapEntry();
      mapEntry.key = key;
      mapEntry.value = value;
      set.add(mapEntry);
    });

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

    Array.from(this.map.keys()).forEach((key) => {
      set.add(key);
    });

    return set;
  }

  put(key, value) {
    const prev = this.get(key);
    this.map.set(key, value);
    return prev;
  }

  putAll(other) {
    Array.from(other.map.entries()).forEach(([key, value]) => {
      this.map.set(key, value);
    });
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
