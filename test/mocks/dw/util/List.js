'use strict';

const Collection = require('./Collection');

class List extends Collection {
  constructor(array = []) {
    super(array);
  }

  addAt(index, value) {
    this.array.splice(index, 0, value);
  }

  concat(...values) {
    return new List(this.array.concat(...values));
  }

  fill(object) {
    this.array.fill(object);
  }

  get(index) {
    return this.array[index];
  }

  indexOf(value) {
    return this.array.indexOf(value);
  }

  join(separator = ',') {
    return this.array.join(separator);
  }

  lastIndexOf(value) {
    return this.array.lastIndexOf(value);
  }

  pop() {
    return this.array.pop();
  }

  push(value) {
    return this.array.push(value);
  }

  removeAt(index) {
    this.array.splice(index, 1);
  }

  replaceAll(oldValue, newValue) {
    this.array = this.array.map((value) => (value === oldValue ? newValue : value));
  }

  reverse() {
    this.array = this.array.reverse();
  }

  rotate(distance) {
    const len = this.array.length;
    const shift = ((distance % len) + len) % len;

    this.array = this.array.slice(-shift).concat(this.array.slice(0, -shift));
  }

  set(index, value) {
    const oldValue = this.array[index];
    this.array[index] = value;
    return oldValue;
  }

  shift() {
    return this.array.shift() || null;
  }

  shuffle() {
    for (let i = this.array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
    }
  }

  slice(from = 0, to = this.array.length) {
    return new List(this.array.slice(from, to));
  }

  sort(comparator) {
    if (typeof comparator === 'function') {
      this.array.sort(comparator);
    } else {
      this.array.sort();
    }
  }

  subList(from, to) {
    return this.slice(from, to);
  }

  swap(i, j) {
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
  }

  unshift(...values) {
    return this.array.unshift(...values);
  }
}

List.EMPTY = new List();

module.exports = List;
