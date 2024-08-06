'use strict';

const Bytes = require('../util/Bytes');

class Encoding {
  static fromBase64(string) {
    if (string === null) {
      throw new Error('Null value is not allowed');
    }
    return new Bytes(Buffer.from(string, 'base64').toString());
  }

  static toBase64(bytes) {
    if (bytes === null) {
      throw new Error('Null value is not allowed');
    }
    return Buffer.from(bytes.bytes).toString('base64');
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

  static toHex(bytes) {
    if (bytes === null) {
      throw new Error('Null value is not allowed');
    }
    return Buffer.from(bytes.bytes).toString('hex');
  }

  static fromURI(string, encoding = 'UTF-8') {
    if (string === null || encoding === null) {
      throw new Error('Null value is not allowed');
    }

    const str = Buffer.from(string, encoding).toString();
    return decodeURIComponent(str.replace(/\+/g, '%20'));
  }

  static toURI(string, encoding = 'UTF-8') {
    if (string === null || encoding === null) {
      throw new Error('Null value is not allowed');
    }

    const str = Buffer.from(string, encoding).toString();
    return encodeURIComponent(str).toString().replace(/%20/g, '+').replace(/[!'()]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
}

module.exports = Encoding;
