'use strict';

/* eslint-disable class-methods-use-this, no-unused-vars */

const DwMap = require('../util/Map');
const Bytes = require('../util/Bytes');

class HTTPClient {
  constructor() {
    this.allowRedirect = true;

    Object.defineProperty(this, 'bytes', {
      enumerable: true,
      get() {
        return new Bytes(this.text);
      }
    });

    Object.defineProperty(this, 'ttl', {
      get() {
        return new Bytes(this.text);
      }
    });

    Object.defineProperty(this, 'errorBytes', {
      enumerable: true,
      get() {
        return new Bytes(this.errorText);
      }
    });

    this.errorText = '';
    this.hostNameVerification = true;
    this.identity = null;
    this.requestHeaders = new DwMap();
    this.responseHeaders = new DwMap();
    this.statusCode = 200;
    this.statusMessage = 'OK';
    this.text = '';
    this.timeout = 0;
  }

  enableCaching(ttl) {
    this.ttl = ttl;
  }

  getAllowRedirect() {
    return this.allowRedirect;
  }

  getBytes() {
    return this.bytes;
  }

  getErrorBytes() {
    return this.errorBytes;
  }

  getErrorText() {
    return this.errorText;
  }

  getHostNameVerification() {
    return this.hostNameVerification;
  }

  getIdentity() {
    return this.identity;
  }

  getResponseHeader(header) {
    return this.responseHeaders.get(header);
  }

  getResponseHeaders(name) {
    if (name) {
      return [];
    }

    return [];
  }

  getStatusCode() {
    return this.statusCode;
  }

  getStatusMessage() {
    return this.statusMessage;
  }

  getText(encoding) {
    if (encoding) {
      return this.bytes.toString(encoding);
    }

    return this.text;
  }

  getTimeout() {
    return this.timeout;
  }

  open(method, url, user, password) { }

  send() { }

  sendAndReceiveToFile() {
    return true;
  }

  sendBytes() { }

  sendBytesAndReceiveToFile() {
    return true;
  }

  sendMultiPart() { }

  setAllowRedirect(allowRedirect) {
    this.allowRedirect = allowRedirect;
  }

  setHostNameVerification(enable) {
    this.hostNameVerification = enable;
  }

  setIdentity(keyRef) {
    this.keyRef = keyRef;
  }

  setRequestHeader(key, value) {
    this.requestHeaders.put(key, value);
  }

  setTimeout(timeoutMillis) {
    this.timeout = timeoutMillis;
  }
}

HTTPClient.MAX_GET_FILE_SIZE = 209715200;
HTTPClient.MAX_GET_MEM_SIZE = 10485760;

module.exports = HTTPClient;
