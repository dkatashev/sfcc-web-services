'use strict';

/* eslint-disable class-methods-use-this */

class FTPClient {
  constructor() {
    this.connected = true;
    this.replyCode = 0;
    this.replyMessage = '';
    this.timeout = 0;
  }

  cd() {
    return true;
  }

  connect() {
    return true;
  }

  del() {
    return true;
  }

  disconnect() {}

  get() {
    return '';
  }

  getBinary() {
    return true;
  }

  getConnected() {
    return this.connected;
  }

  getReplyCode() {
    return this.replyCode;
  }

  getReplyMessage() {
    return this.replyMessage;
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

  setTimeout(timeoutMillis) {
    this.timeout = timeoutMillis;
  }
}

module.exports = FTPClient;
