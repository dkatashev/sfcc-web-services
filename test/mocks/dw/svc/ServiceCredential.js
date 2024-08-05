'use strict';

const ExtensibleObject = require('../object/ExtensibleObject');

class ServiceCredential extends ExtensibleObject {
  constructor(ID = '', URL = '', user = 'user', password = 'password') {
    super();
    this.ID = ID;
    this.URL = URL;
    this.user = user;
    this.password = password;
  }

  getID() {
    return this.ID;
  }

  getPassword() {
    return this.password;
  }

  getURL() {
    return this.URL;
  }

  getUser() {
    return this.user;
  }
}

module.exports = ServiceCredential;
