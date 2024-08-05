'use strict';

const Service = require('./Service');
const FTPService = require('./FTPService');
const HTTPService = require('./HTTPService');
const SOAPService = require('./SOAPService');

class LocalServiceRegistry {
  static createService(serviceId, serviceCallback) {
    if (typeof serviceId !== 'string') {
      throw new TypeError('serviceId should be a string');
    }

    if (serviceCallback === null || typeof serviceCallback !== 'object') {
      throw new TypeError('serviceCallback should be an object');
    }

    const lowerServiceId = serviceId.toLowerCase();

    if (lowerServiceId.includes('http')) {
      return new HTTPService(serviceId, serviceCallback);
    }

    if (lowerServiceId.includes('soap')) {
      return new SOAPService(serviceId, serviceCallback);
    }

    if (lowerServiceId.includes('ftp')) {
      return new FTPService(serviceId, serviceCallback, 'ftp');
    }

    if (lowerServiceId.includes('sftp')) {
      return new FTPService(serviceId, serviceCallback, 'sftp');
    }

    return new Service(serviceId, serviceCallback);
  }
}

module.exports = LocalServiceRegistry;
