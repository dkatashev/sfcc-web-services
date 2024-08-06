'use strict';

class Bytes {
  constructor(string, encoding) {
    this.bytes = Buffer.from(string, encoding || 'UTF-8');
    this.length = this.bytes.length;
  }

  byteAt(index) {
    if (index < 0 || index >= this.length) {
      throw new RangeError('Index out of range');
    }
    return this.bytes[index];
  }

  bytesAt(index, length) {
    return new Bytes(this.bytes.slice(index, index + length).toString());
  }

  getLength() {
    return this.length;
  }

  intAt(index) {
    return this.bytes.readInt32BE(index);
  }

  shortAt(index) {
    return this.bytes.readInt16BE(index);
  }

  reverse() {
    const reversed = Buffer.from(this.bytes).reverse();
    return new Bytes(reversed.toString());
  }

  toString(encoding) {
    return this.bytes.toString(encoding || 'UTF-8');
  }
}

module.exports = Bytes;
