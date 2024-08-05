'use strict';

const DwMap = require('../util/Map');
const WebDAVFileInfo = require('./WebDAVFileInfo');

class WebDAVClient {
  constructor(rootUrl, user, password) {
    this.rootUrl = rootUrl;
    this.user = user;
    this.password = password;
    this.allRequestHeaders = new DwMap();
    this.allResponseHeaders = new DwMap();
    this.statusCode = -1;
    this.statusText = '';
  }

  addRequestHeader(headerName, headerValue) {
    this.allRequestHeaders.put(headerName, headerValue);
  }

  close() { }

  copy() {
    return true;
  }

  del() {
    return true;
  }

  get() { }

  getAllResponseHeaders() {
    return this.allResponseHeaders;
  }

  getResponseHeader(header) {
    return this.allResponseHeaders.get(header);
  }

  getBinary() { }

  getStatusCode() {
    return this.statusCode;
  }

  getStatusText() {
    return this.statusText;
  }

  mkcol() {
    return true;
  }

  move() {
    return true;
  }

  options() {
    return [];
  }

  propfind() {
    return [new WebDAVFileInfo()];
  }

  put() {
    return true;
  }

  succeeded() {
    return true;
  }
}

WebDAVClient.DEFAULT_ENCODING = "UTF-8";
WebDAVClient.DEFAULT_GET_FILE_SIZE = 5242880;
WebDAVClient.DEFAULT_GET_STRING_SIZE = 2097152;
WebDAVClient.DEPTH_0 = 0;
WebDAVClient.DEPTH_1 = 1;
WebDAVClient.DEPTH_INIFINITY = 2147483647;
WebDAVClient.MAX_GET_FILE_SIZE = 209715200;
WebDAVClient.MAX_GET_STRING_SIZE = 10485760;

module.exports = WebDAVClient;
