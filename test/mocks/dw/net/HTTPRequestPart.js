'use strict';

const File = require('../io/File');
const Bytes = require('../util/Bytes');

class HTTPRequestPart {
  constructor(name, value, contentType = null, encoding = null, fileName = null) {
    this.name = name;
    this.bytesValue = null;
    this.fileValue = null;
    this.stringValue = null;
    this.contentType = contentType || 'text/plain';
    this.encoding = encoding || 'US-ASCII';
    this.fileName = fileName;

    if (value instanceof Bytes) {
      this.bytesValue = value;
      if (!contentType) this.contentType = 'application/octet-stream';
    } else if (value instanceof File) {
      this.fileValue = value;
      if (!contentType) this.contentType = 'application/octet-stream';
      if (!encoding) this.encoding = 'ISO-8859-1';
      if (!fileName) this.fileName = value.path;
    } else if (typeof value === 'string') {
      this.stringValue = value;
      if (!contentType) this.contentType = 'text/plain';
      if (!encoding) this.encoding = 'US-ASCII';
    } else {
      throw new TypeError('Invalid value type for HTTPRequestPart');
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
