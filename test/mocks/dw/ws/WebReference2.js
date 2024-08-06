'use strict';

const sinon = require('sinon');
const Port = require('./Port');

class WebReference2 {
  constructor(services = { defaultService: new Port() }, requests = []) {
    this.services = services;
    this.defaultService = this.services.defaultService;

    requests.forEach((operation) => {
      this[operation] = sinon.stub();
    });
  }

  getDefaultService() {
    return this.defaultService;
  }

  getService(service, portName) {
    return this.services[service][portName];
  }
}

module.exports = WebReference2;
