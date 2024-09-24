'use strict';

class Iterator {
  constructor(array) {
    this.array = array;
    this.position = 0;
  }

  asList(start = 0, size = this.array.length) {
    const List = require('./List');
    return new List(this.array.slice(start, size));
  }

  hasNext() {
    return this.position < this.array.length;
  }

  next() {
    return this.array[this.position++];
  }
}

module.exports = Iterator;
