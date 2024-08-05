'use strict';

const PersistentObject = require('./PersistentObject');

class ExtensibleObject extends PersistentObject {
  constructor() {
    super();
    this.custom = {};
  }

  getCustom() {
    return this.custom;
  }
}

module.exports = ExtensibleObject;
