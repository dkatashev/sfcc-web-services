'use strict';

const Service = require('./Service');
const FTPClient = require('../net/FTPClient');
const SFTPClient = require('../net/SFTPClient');

class FTPService extends Service {
  constructor(type, serviceCallback) {
    super(serviceCallback);
    this.autoDisconnect = false;
    this.client = type === 'ftp' ? new FTPClient() : new SFTPClient();
  }

  getClient() {
    return this.client;
  }

  isAutoDisconnect() {
    return this.autoDisconnect;
  }

  setAutoDisconnect(status) {
    this.autoDisconnect = status;
    return this;
  }

  setOperation(name, ...args) {
    const method = this.client[name];

    if (typeof method !== 'function') {
      throw new Error(`${method} is not found in (S)FTP client.`);
    }

    method(...args);

    return this;
  }
}

module.exports = FTPService;
