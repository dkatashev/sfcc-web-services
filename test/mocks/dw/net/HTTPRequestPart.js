'use strict';

const File = require('../io/File');
const Bytes = require('../util/Bytes');

class HTTPRequestPart {
  constructor(name, value, contentType, encoding, fileName) {
    this.name = name;
    this.bytesValue = null;
    this.stringValue = null;
    this.fileValue = null;
    this.contentType = contentType || 'text/plain';
    this.encoding = encoding || 'ISO-8859-1';
    this.fileName = fileName || null;

    if (value instanceof Bytes) {
      this.bytesValue = value;
      this.contentType = contentType || 'application/octet-stream';
      if (!encoding) this.encoding = null;
    } else if (value instanceof File) {
      this.fileValue = value;
      this.contentType = contentType || 'application/octet-stream';
    } else if (typeof value === 'string') {
      this.stringValue = value;
      this.bytesValue = new Bytes(value, encoding || 'ASCII');
    }
  }

  getBytesValue() {
    return this.bytesValue;
  }

  getContentType() {
    return this.contentType;
  }

  getEncoding() {
    return this.encoding;
  }

  getFileName() {
    return this.fileName;
  }

  getFileValue() {
    return this.fileValue;
  }

  getName() {
    return this.name;
  }

  getStringValue() {
    return this.stringValue;
  }
}

module.exports = HTTPRequestPart;
