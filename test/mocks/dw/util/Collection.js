'use strict';

const Iterator = require('./Iterator');

class Collection {
  constructor() {
    Object.defineProperties(this, {
      array: {
        value: []
      },
      empty: {
        get() {
          return Boolean(this.array.length);
        }
      },
      length: {
        get() {
          return this.array.length;
        }
      },
    });
  }

  add(...values) {
    let items = values;

    if (values.length === 1 && Array.isArray(values[0])) {
      items = values[0];
    }

    this.array.push(...items);

    return true;
  }

  add1(object) {
    this.array.push(object);
    return true;
  }

  addAll(collection) {
    this.add(collection.array);
    return true;
  }

  clear() {
    this.array = [];
  }

  contains(object) {
    return this.array.some(item => item === object);
  }

  containsAll(collection) {
    return this.array.every(item => collection.array.includes(item));
  }

  getLength() {
    return this.length;
  }

  isEmpty() {
    return this.empty;
  }

  iterator() {
    return new Iterator(this.array);
  }

  remove(object) {
    const index = this.array.indexOf(object);
    if (index > -1) {
      this.array.splice(index, 1);
    }
    return true;
  }

  removeAll(collection) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of collection.array) {
      this.remove(item);
    }
    return true;
  }

  retainAll(collection) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of this.array) {
      if (!collection.array.includes(item)) {
        this.remove(item);
      }
    }
    return true;
  }

  size() {
    return this.length;
  }

  toArray(start = 0, size = this.array.length) {
    return this.array.slice(start, size);
  }
}

module.exports = Collection;
