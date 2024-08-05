'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

class File {
  constructor(absPath) {
    if (typeof absPath === 'string') {
      this.fullPath = path.join(os.tmpdir(), path.normalize(absPath));
    } else if (absPath instanceof File) {
      this.fullPath = path.join(os.tmpdir(), absPath.fullPath, absPath.path);
    } else {
      throw new Error('Invalid constructor parameters');
    }

    this.name = path.basename(this.fullPath);
    this.path = path.relative('/', this.fullPath);
    this.rootDirectoryType = this._getRootDirectoryTypeFromPath(this.fullPath);
    this.directory = fs.statSync(this.fullPath).isDirectory();
    this.file = fs.statSync(this.fullPath).isFile();
  }

  copyTo(destFile) {
    if (this.isDirectory()) {
      throw new Error('Cannot copy directories');
    }
    fs.copyFileSync(this.fullPath, destFile.fullPath);
    return new File(destFile.fullPath);
  }

  createNewFile() {
    if (this.exists()) {
      return false;
    }
    fs.writeFileSync(this.fullPath, '');
    return true;
  }

  exists() {
    return fs.existsSync(this.fullPath);
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

  static getRootDirectory(rootDir, ...args) {
    let rootPath = rootDir;
    if (args.length > 0) {
      rootPath = path.join(rootDir, ...args);
    }
    return new File(rootPath);
  }

  getRootDirectoryType() {
    return this.rootDirectoryType;
  }

  gunzip(destDir) {
    // Implement gunzip logic here
  }

  gzip(destFile) {
    // Implement gzip logic here
  }

  isDirectory() {
    return this.directory;
  }

  isFile() {
    return this.file;
  }

  lastModified() {
    return fs.statSync(this.fullPath).mtimeMs;
  }

  length() {
    return fs.statSync(this.fullPath).size;
  }

  list() {
    if (!this.isDirectory()) {
      return null;
    }
    return fs.readdirSync(this.fullPath);
  }

  listFiles(filter = null) {
    if (!this.isDirectory()) {
      return null;
    }
    const files = fs.readdirSync(this.fullPath).map(file => new File(path.join(this.fullPath, file)));
    if (filter) {
      return files.filter(filter);
    }
    return files;
  }

  md5() {
    const data = fs.readFileSync(this.fullPath);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  mkdir() {
    if (this.exists()) {
      return false;
    }
    fs.mkdirSync(this.fullPath);
    return true;
  }

  mkdirs() {
    if (this.exists()) {
      return false;
    }
    fs.mkdirSync(this.fullPath, { recursive: true });
    return true;
  }

  remove() {
    if (this.isDirectory()) {
      fs.rmdirSync(this.fullPath);
    } else {
      fs.unlinkSync(this.fullPath);
    }
    return !this.exists();
  }

  renameTo(destFile) {
    fs.renameSync(this.fullPath, destFile.fullPath);
    return true;
  }

  unzip(destDir) {
    // Implement unzip logic here
  }

  zip(destFile) {
    // Implement zip logic here
  }

  _getRootDirectoryTypeFromPath(filePath) {
    const segments = filePath.split(path.sep);
    return segments.length > 1 ? segments[1].toUpperCase() : '';
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
