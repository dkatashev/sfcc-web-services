'use strict';

const SFTPFileInfo = require('./SFTPFileInfo');

/* eslint-disable class-methods-use-this */

class SFTPClient {
  constructor() {
    this.connected = true;
    this.errorMessage = '';
    this.timeout = 0;
  }

  addKnownHostKey() { }

  cd() {
    return true;
  }

  connect() {
    return true;
  }

  del() {
    return true;
  }

  disconnect() { }

  get() {
    return '';
  }

  getBinary() {
    return true;
  }

  getConnected() {
    return this.connected;
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getFileInfo() {
    return new SFTPFileInfo('name', 0, false, new Date());
  }

  getTimeout() {
    return this.timeout;
  }

  list() {
    return [];
  }

  mkdir() {
    return true;
  }

  put() {
    return true;
  }

  putBinary() {
    return true;
  }

  removeDirectory() {
    return true;
  }

  rename() {
    return true;
  }

  setIdentity() { }

  setTimeout(timeoutMillis) {
    this.timeout = timeoutMillis;
  }
}

module.exports = SFTPClient;
