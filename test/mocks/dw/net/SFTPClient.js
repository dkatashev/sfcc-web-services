'use strict';

const sinon = require('sinon');

class SFTPClient {
  constructor() {
    this.connected = false;
    this.errorMessage = '';
    this.timeout = 0;
    this.keyRef = null;

    this.addKnownHostKey = sinon.stub();
    this.cd = sinon.stub();
    this.connect = sinon.stub();
    this.del = sinon.stub();
    this.disconnect = sinon.stub();
    this.get = sinon.stub();
    this.getBinary = sinon.stub();
    this.getFileInfo = sinon.stub();
    this.list = sinon.stub();
    this.mkdir = sinon.stub();
    this.put = sinon.stub();
    this.putBinary = sinon.stub();
    this.removeDirectory = sinon.stub();
    this.rename = sinon.stub();
  }

  getConnected() {
    return this.connected;
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getTimeout() {
    return this.timeout;
  }

  setIdentity(keyRef) {
    this.keyRef = keyRef;
  }

  setTimeout(timeout) {
    this.timeout = timeout;
  }
}

SFTPClient.MAX_GET_FILE_SIZE = 209715200;
SFTPClient.MAX_GET_STRING_SIZE = 10485760;

module.exports = SFTPClient;
