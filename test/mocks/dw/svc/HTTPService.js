'use strict';

const Service = require('./Service');
const HTTPClient = require('../net/HTTPClient');

class HTTPService extends Service {
  constructor(serviceId, callbacks) {
    super(serviceId, callbacks, 'HTTP');

    this.authentication = 'BASIC';
    this.cachingTTL = 0;
    this.client = new HTTPClient();
    this.encoding = 'UTF-8';
    this.hostNameVerification = this.client.hostNameVerification;
    this.identity = this.client.identity;
    this.outFile = null;
    this.requestMethod = 'POST';
  }

  addHeader(name, value) {
    this.client.setRequestHeader(name, value);
    return this;
  }

  addParam(name, value) {
    const url = new URL(this.URL);
    url.searchParams.append(name, value);
    this.URL = url.toString();
    return this;
  }

  getAuthentication() {
    return this.authentication;
  }

  getCachingTTL() {
    return this.cachingTTL;
  }

  getClient() {
    return this.client;
  }

  getEncoding() {
    return this.encoding;
  }

  getHostNameVerification() {
    return this.hostNameVerification;
  }

  getIdentity() {
    return this.identity;
  }

  getOutFile() {
    return this.outFile;
  }

  getRequestMethod() {
    return this.requestMethod;
  }

  setAuthentication(authentication) {
    this.authentication = authentication;
    return this;
  }

  setCachingTTL(ttl) {
    this.cachingTTL = ttl;
    return this;
  }

  setEncoding(encoding) {
    this.encoding = encoding;
    return this;
  }

  setHostNameVerification(enable) {
    this.client.hostNameVerification = enable;
    this.hostNameVerification = this.client.hostNameVerification;
    return this;
  }

  setIdentity(identity) {
    this.client.identity = identity;
    this.identity = this.client.identity;
    return this;
  }

  setOutFile(identity) {
    this.outFile = identity;
    return this;
  }

  setRequestMethod(requestMethod) {
    this.requestMethod = requestMethod;
    return this;
  }
}

module.exports = HTTPService;
