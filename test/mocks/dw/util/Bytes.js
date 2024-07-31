'use strict';

function Bytes(string, encoding) {
  this.bytes = Buffer.from(string, encoding || 'UTF-8');
  this.length = this.bytes.length;
}

Bytes.prototype.byteAt = function (index) {
  if (index < 0 || index >= this.length) {
    throw new RangeError('Index out of range');
  }
  return this.bytes[index];
};

Bytes.prototype.bytesAt = function (index, length) {
  return new Bytes(this.bytes.slice(index, index + length).toString());
};

Bytes.prototype.getLength = function () {
  return this.length;
};

Bytes.prototype.intAt = function (index) {
  return this.bytes.readInt32BE(index);
};

Bytes.prototype.shortAt = function (index) {
  return this.bytes.readInt16BE(index);
};

Bytes.prototype.reverse = function () {
  var reversed = Buffer.from(this.bytes).reverse();
  return new Bytes(reversed.toString());
};

Bytes.prototype.toString = function (encoding) {
  return this.bytes.toString(encoding || 'UTF-8');
};

module.exports = Bytes;
