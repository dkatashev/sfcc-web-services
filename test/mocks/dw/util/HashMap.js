'use strict';

const DwMap = require('./Map');

class HashMap extends DwMap {
  clone() {
    return new HashMap(new Map(this.map));
  }
}

module.exports = HashMap;
