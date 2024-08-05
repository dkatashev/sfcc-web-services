'use strict';

class FTPFileInfo {
  /**
   * @param {string} name
   * @param {number} size
   * @param {boolean} directory
   * @param {Date} timestamp
   */
  constructor(name, size, directory, timestamp) {
    this.name = name;
    this.size = size;
    this.directory = directory;
    this.timestamp = timestamp;
  }

  getDirectory() {
    return this.directory;
  }

  getName() {
    return this.name;
  }

  getSize() {
    return this.size;
  }

  getTimestamp() {
    return this.timestamp;
  }
}

module.exports = FTPFileInfo;
