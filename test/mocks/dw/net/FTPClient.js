'use strict';

const sinon = require('sinon');

class FTPClient {
  constructor() {
    this.connected = false;
    this.replyCode = 0;
    this.replyMessage = '';
    this.timeout = 0;

    this.cd = sinon.stub();
    this.connect = sinon.stub();
    this.del = sinon.stub();
    this.disconnect = sinon.stub();
    this.get = sinon.stub();
    this.getBinary = sinon.stub();
    this.list = sinon.stub();
    this.mkdir = sinon.stub();
    this.put = sinon.stub();
    this.putBinary = sinon.stub();
    this.removeDirectory = sinon.stub();
    this.rename = sinon.stub();
    this.setTimeout = sinon.stub();
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

  setTimeout(timeout) {
    this.timeout = timeout;
  }
}

FTPClient.DEFAULT_GET_FILE_SIZE = 5242880;
FTPClient.DEFAULT_GET_STRING_SIZE = 2097152;
FTPClient.MAX_GET_FILE_SIZE = 209715200;
FTPClient.MAX_GET_STRING_SIZE = 10485760;

module.exports = FTPClient;
