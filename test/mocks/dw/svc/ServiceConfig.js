'use strict';

const ExtensibleObject = require('../object/ExtensibleObject');
const ServiceCredential = require('./ServiceCredential');
const ServiceProfile = require('./ServiceProfile');

const serviceConfigMap = {
  HTTP: {
    credentialID: 'http.service.credentials',
    url: 'https://test.com',
    profileID: 'http.service.profile',
    timeout: 3000,
  },
  HTTPForm: {
    credentialID: 'form.service.credentials',
    url: 'https://test.com',
    profileID: 'form.service.profile',
    timeout: 3000,
  },
  SOAP: {
    credentialID: 'soap.service.credentials',
    url: 'https://test.com',
    profileID: 'soap.service.profile',
    timeout: 3000,
  },
  FTP: {
    credentialID: 'ftp.service.credentials',
    url: 'ftp://test.com',
    profileID: 'ftp.service.profile',
    timeout: null,
  },
  SFTP: {
    credentialID: 'sftp.service.credentials',
    url: 'sftp://test.com',
    profileID: 'sftp.service.profile',
    timeout: 3000,
  },
  WEBDAV: {
    credentialID: 'webdav.service.credentials',
    url: 'https://test.com',
    profileID: 'webdav.service.profile',
    timeout: 3000,
  },
  GENERIC: {
    credentialID: 'generic.service.credentials',
    url: '',
    profileID: 'generic.service.profile',
    timeout: null,
  },
};

class ServiceConfig extends ExtensibleObject {
  constructor(serviceType = '') {
    super();

    const config = serviceConfigMap[serviceType] || serviceConfigMap.GENERIC;

    this.ID = 'service.config';
    this.serviceType = serviceType;
    this.credential = new ServiceCredential(config.credentialID, config.url);
    this.profile = new ServiceProfile(config.profileID, config.timeout);
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
