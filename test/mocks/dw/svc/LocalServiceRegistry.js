'use strict';

const Service = require('./Service');
const FTPService = require('./FTPService');
const HTTPService = require('./HTTPService');
const SOAPService = require('./SOAPService');

class LocalServiceRegistry {
  static createService(serviceId, callbacks) {
    if (typeof serviceId !== 'string') {
      throw new TypeError('serviceId should be a string');
    }

    if (callbacks === null || typeof callbacks !== 'object') {
      throw new TypeError('callbacks should be an object');
    }

    if (serviceId.startsWith('http')) {
      return new HTTPService(serviceId, callbacks);
    }

    if (serviceId.startsWith('ftp')) {
      return new FTPService(serviceId, callbacks, 'FTP');
    }

    if (serviceId.startsWith('sftp')) {
      return new FTPService(serviceId, callbacks, 'SFTP');
    }

    if (serviceId.startsWith('soap')) {
      return new SOAPService(serviceId, callbacks);
    }

    if (serviceId.startsWith('webdav')) {
      return new Service(serviceId, callbacks, 'WEBDAV');
    }

    return new Service(serviceId, callbacks);
  }
}

module.exports = LocalServiceRegistry;
