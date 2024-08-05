'use strict';

const Bytes = require('../util/Bytes');

class Encoding {
  static fromBase64(string) {
    if (string === null) {
      throw new Error('Null value is not allowed');
    }
    return new Bytes(Buffer.from(string, 'base64').toString());
  }

  static fromHex(string) {
    if (string === null) {
      throw new Error('Null value is not allowed');
    }
    if (string.length % 2 !== 0) {
      throw new Error('Invalid hexadecimal string');
    }
    return new Bytes(Buffer.from(string, 'hex').toString());
  }

  static fromURI(string, encoding = 'UTF-8') {
    if (string === null || encoding === null) {
      throw new Error('Null value is not allowed');
    }
    return decodeURIComponent(Buffer.from(string, encoding).toString());
  }

  static toBase64(bytes) {
    if (bytes === null) {
      throw new Error('Null value is not allowed');
    }
    return bytes.toString('base64');
  }

  static toHex(bytes) {
    if (bytes === null) {
      throw new Error('Null value is not allowed');
    }
    return bytes.toString('hex');
  }

  static toURI(string, encoding = 'UTF-8') {
    if (string === null || encoding === null) {
      throw new Error('Null value is not allowed');
    }
    return encodeURIComponent(Buffer.from(string, encoding).toString());
  }
}

module.exports = Encoding;
