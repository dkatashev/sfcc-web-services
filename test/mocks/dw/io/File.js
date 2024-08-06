'use strict';

const { posix: path } = require('path');
const Bytes = require('../util/Bytes');

class File {
  constructor(rootDir, relPath) {
    if (typeof rootDir === 'string') {
      this.fullPath = path.normalize(rootDir);
    } else if (rootDir instanceof File && typeof relPath === 'string') {
      this.fullPath = path.join(rootDir.fullPath, relPath);
    } else {
      throw new Error('Invalid constructor parameters');
    }

    this.rootDirectoryType = this._getRootDirectoryTypeFromPath(this.fullPath);
    this.name = path.basename(this.fullPath);
    this.path = this.fullPath.replace(`/${this.rootDirectoryType}`, '');
    this.directory = this.fullPath.endsWith(File.SEPARATOR);
    this.file = !this.directory;
    this.lastModifiedDate = new Date();
    this.fileContent = '';
    this.childFiles = [];

    Object.defineProperty(this, 'fileBytes', {
      enumerable: true,
      get() {
        return new Bytes(this.fileContent);
      }
    });
  }

  getFullPath() {
    return this.fullPath;
  }

  getName() {
    return this.name;
  }

  getPath() {
    return this.path;
  }

  getRootDirectoryType() {
    return this.rootDirectoryType;
  }

  isDirectory() {
    return this.directory;
  }

  isFile() {
    return this.file;
  }

  lastModified() {
    return this.lastModifiedDate.valueOf();
  }

  length() {
    return this.fileBytes.length;
  }

  createNewFile() {
    if (this.exists()) {
      return false;
    }
    this.file = true;
    this.directory = false;
    this.lastModifiedDate = new Date();
    return true;
  }

  exists() {
    return this.file || this.directory;
  }

  mkdir() {
    if (!this.exists()) {
      this.directory = true;
      this.file = false;
      this.lastModifiedDate = new Date();
      return true;
    }
    return false;
  }

  mkdirs() {
    // Simulate the creation of parent directories if needed
    const parts = this.fullPath.split(path.sep);
    let currentPath = '';

    parts.forEach((part) => {
      currentPath += part + path.sep;
      if (!currentPath.endsWith(File.SEPARATOR)) {
        currentPath = path.normalize(currentPath + File.SEPARATOR);
      }
    });

    this.directory = true;
    this.file = false;
    this.lastModifiedDate = new Date();
    return true;
  }

  remove() {
    if (this.exists()) {
      this.file = false;
      this.directory = false;
      return true;
    }
    return false;
  }

  renameTo(dest) {
    if (dest instanceof File) {
      dest.fileContent = this.fileContent;
      dest.lastModifiedDate = new Date();
      this.remove();
      return true;
    }
    return false;
  }

  list() {
    return this.childFiles.map((file) => file.getName());
  }

  listFiles() {
    return this.childFiles;
  }

  copyTo(dest) {
    if (dest instanceof File && !dest.exists()) {
      dest.fileContent = this.fileContent;
      dest.lastModifiedDate = new Date();
      return dest;
    }
    return null;
  }

  md5() {
    // Simple MD5 hash simulation
    return require('crypto').createHash('md5').update(this.fileContent).digest('hex');
  }

  static getRootDirectory(rootDir, ...args) {
    const filePath = path.join(rootDir, ...args);
    return new File(filePath);
  }

  _getRootDirectoryTypeFromPath(fullPath) {
    const segments = fullPath.split(path.sep);
    const key = segments.length > 1 ? segments[1].toUpperCase() : '';
    return File[key] || '';
  }

  unzip(root) {
    if (this.file) {
      // Simulate unzipping process
      this.childFiles.push(new File(root, 'unzipped_file.txt'));
    }
  }

  zip(outputZipFile) {
    if (this.file || this.directory) {
      // Simulate zipping process
      outputZipFile.fileContent = 'zipped content';
    }
  }

  gunzip(root) {
    if (this.file) {
      // Simulate gunzipping process
      this.childFiles.push(new File(root, 'gunzipped_file.txt'));
    }
  }

  gzip(outputZipFile) {
    if (this.file) {
      // Simulate gzipping process
      outputZipFile.fileContent = 'gzipped content';
    }
  }
}

File.CATALOGS = 'CATALOGS';
File.CUSTOMER_SNAPSHOTS = 'CUSTOMERSNAPSHOTS';
File.CUSTOMERPI = 'CUSTOMERPI';
File.DYNAMIC = 'DYNAMIC';
File.IMPEX = 'IMPEX';
File.LIBRARIES = 'LIBRARIES';
File.REALMDATA = 'REALMDATA';
File.SEPARATOR = '/';
File.STATIC = 'STATIC';
File.TEMP = 'TEMP';

module.exports = File;
