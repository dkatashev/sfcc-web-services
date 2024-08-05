'use strict';

const ServiceConfig = require('./ServiceConfig');
const Result = require('./Result');

class Service {
  constructor(serviceId, callbacks) {
    this.serviceId = serviceId;
    this.callbacks = callbacks;
    this.configuration = new ServiceConfig();
    this.credentialID = '';
    this.mock = false;
    this.requestData = {};
    this.response = {};
    this.throwOnError = false;
    this.URL = this.configuration.credential.URL;
  }

  call(...args) {
    if (this.mock && typeof this.callbacks.mockFull === 'function') {
      return this.configObj.mockFull(this, args);
    }

    if (typeof this.callbacks.initServiceClient === 'function') {
      this.client = this.callbacks.initServiceClient(this);
    }

    if (typeof this.callbacks.createRequest === 'function') {
      this.requestData = this.callbacks.createRequest(this, ...args);

      if (typeof this.callbacks.getRequestLogMessage === 'function') {
        this.callbacks.getRequestLogMessage(this.requestData);
      }
    }

    if (this.callbacks.executeOverride && typeof this.callbacks.execute === 'function') {
      this.callbacks.execute(this, this.requestData);
    }

    if (typeof this.callbacks.parseResponse === 'function') {
      this.response = this.callbacks.parseResponse(this, this.requestData);

      if (typeof this.callbacks.getResponseLogMessage === 'function') {
        this.callbacks.getResponseLogMessage(this.response);
      }
    }

    if (typeof this.callbacks.filterLogMessage === 'function') {
      this.callbacks.filterLogMessage(JSON.stringify({
        request: this.requestData,
        response: this.response
      }));
    }

    let result;

    switch (args[0].__unitTestStatus) {
      case 'OK':
        result = Result.unitTest.OK;
        result.object = this.response;
        break;
      case 'ERROR':
        result = Result.unitTest.ERROR;
        break;
      default:
        result = new Result();
        result.object = this.response;
        break;
    }

    return result;
  }

  getConfiguration() {
    return this.configuration;
  }

  getCredentialID() {
    return this.credentialID;
  }

  getRequestData() {
    return this.requestData;
  }

  getResponse() {
    return this.response;
  }

  getURL() {
    return this.URL;
  }

  isMock() {
    return this.mock;
  }

  isThrowOnError() {
    return this.throwOnError;
  }

  setCredentialID(id) {
    this.credentialID = id;
    return this;
  }

  setMock() {
    this.mock = true;
    return this;
  }

  setThrowOnError() {
    this.mock = true;
    return this;
  }

  setURL(url) {
    this.URL = url;
    return this;
  }
}

module.exports = Service;
