'use strict';

const Result = require('./Result');
const ServiceConfig = require('./ServiceConfig');

class Service {
  constructor(serviceId, callbacks, serviceType) {
    this.serviceId = serviceId;
    this.callbacks = callbacks;

    this.configuration = new ServiceConfig(serviceType);
    this.credentialID = '';
    this.mock = false;
    this.requestData = {};
    this.response = {};
    this.throwOnError = false;
    this.URL = this.configuration.credential.URL;
  }

  call(...args) {
    const {
      mockFull,
      initServiceClient,
      createRequest,
      getRequestLogMessage,
      executeOverride,
      execute,
      parseResponse,
      getResponseLogMessage,
      filterLogMessage,
    } = this.callbacks;

    try {
      if (this.mock && typeof mockFull === 'function') {
        return mockFull(this, args);
      }

      if (typeof initServiceClient === 'function') {
        this.client = initServiceClient(this);
      }

      if (typeof createRequest === 'function') {
        this.requestData = createRequest(this, ...args);

        if (typeof getRequestLogMessage === 'function') {
          getRequestLogMessage(this.requestData);
        }
      }

      if (executeOverride && typeof execute === 'function') {
        execute(this, this.requestData);
      }

      if (typeof parseResponse === 'function') {
        this.response = parseResponse(this, this.requestData);

        if (typeof getResponseLogMessage === 'function') {
          getResponseLogMessage(this.response);
        }
      }

      if (typeof filterLogMessage === 'function') {
        filterLogMessage(
          JSON.stringify({
            request: this.requestData,
            response: this.response
          })
        );
      }

      return new Result(Result.OK, this.response);
    } catch (error) {
      const errorResult = new Result(Result.ERROR, this.response);
      errorResult.errorMessage = error.message;
      return errorResult;
    }
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
