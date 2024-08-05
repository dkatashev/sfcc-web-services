'use strict';

const ExtensibleObject = require('../object/ExtensibleObject');
const ServiceCredential = require('./ServiceCredential');
const ServiceProfile = require('./ServiceProfile');

class ServiceConfig extends ExtensibleObject {
  constructor() {
    super();
    this.ID = '';
    this.credential = new ServiceCredential();
    this.profile = new ServiceProfile();
    this.serviceType = '';
  }

  getCredential() {
    return this.credential;
  }

  getID() {
    return this.ID;
  }

  getProfile() {
    return this.profile;
  }

  getServiceType() {
    return this.serviceType;
  }
}

module.exports = ServiceConfig;
