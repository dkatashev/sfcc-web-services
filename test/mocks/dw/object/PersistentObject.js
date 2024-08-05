'use strict';

const crypto = require('crypto');

class PersistentObject {
  constructor() {
    this.creationDate = new Date();
    this.lastModified = new Date();
    this.UUID = crypto.randomUUID();
  }

  getCreationDate() {
    return this.creationDate;
  }

  getLastModified() {
    return this.lastModified;
  }

  getUUID() {
    return this.UUID;
  }
}

module.exports = PersistentObject;
