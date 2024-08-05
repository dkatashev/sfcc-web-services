'use strict';

class SFTPFileInfo {
  /**
   * @param {string} name
   * @param {number} size
   * @param {boolean} directory
   * @param {Date} modificationTime
   */
  constructor(name, size, directory, modificationTime) {
    this.name = name;
    this.size = size;
    this.directory = directory;
    this.modificationTime = modificationTime;
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

  getModificationTime() {
    return this.modificationTime;
  }
}

module.exports = SFTPFileInfo;
