'use strict';

class XML {
  constructor(value) {
    this.xml = String(value);
  }

  toXMLString() {
    return this.xml;
  }
}

module.exports = XML;
