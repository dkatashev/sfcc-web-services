'use strict';

const ExtensibleObject = require('../object/ExtensibleObject');

class ServiceProfile extends ExtensibleObject {
  constructor() {
    super();
    this.ID = '';
    this.cbCalls = 0;
    this.cbMillis = 0;
    this.rateLimitCalls = 0;
    this.rateLimitMillis = 0;
    this.timeoutMillis = 0;
  }

  getCbCalls() {
    return this.cbCalls;
  }

  getCbMillis() {
    return this.cbMillis;
  }

  getID() {
    return this.ID;
  }

  getRateLimitCalls() {
    return this.rateLimitCalls;
  }

  getRateLimitMillis() {
    return this.rateLimitMillis;
  }

  getTimeoutMillis() {
    return this.timeoutMillis;
  }
}

module.exports = ServiceProfile;
