'use strict';

class WebDAVFileInfo {
  constructor() {
    this.contentType = '';
    this.creationDate = new Date();
    this.lastModifiedDate = new Date();
    this.directory = false;
    this.name = 'name';
    this.path = 'path';
    this.size = 0;
  }

  getContentType() {
    return this.contentType;
  }

  getCreationDate() {
    return this.creationDate;
  }

  getName() {
    return this.name;
  }

  getPath() {
    return this.path;
  }

  getSize() {
    return this.size;
  }

  isDirectory() {
    return this.directory;
  }

  lastModified() {
    return this.lastModifiedDate;
  }
}

module.exports = WebDAVFileInfo;
