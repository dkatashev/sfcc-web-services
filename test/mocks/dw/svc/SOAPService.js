'use strict';

const Service = require('./Service');

class SOAPService extends Service {
  constructor(serviceId, callbacks, serviceType) {
    super(serviceId, callbacks, serviceType);

    this.authentication = 'BASIC';
    this.serviceClient = {};
    this.client = this.serviceClient;
  }

  getAuthentication() {
    return this.authentication;
  }

  getServiceClient() {
    return this.serviceClient;
  }

  setAuthentication(authentication) {
    this.authentication = authentication;
    return this;
  }

  setServiceClient(client) {
    this.serviceClient = client;
    this.client = this.serviceClient;
    return this;
  }
}

module.exports = SOAPService;
