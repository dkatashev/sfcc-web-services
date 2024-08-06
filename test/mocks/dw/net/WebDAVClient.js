'use strict';

const sinon = require('sinon');
const HashMap = require('../util/HashMap');

class WebDAVClient {
  constructor(rootUrl, username, password) {
    this.rootUrl = rootUrl;
    this.username = username || null;
    this.password = password || null;
    this.allRequestHeaders = new HashMap();
    this.allResponseHeaders = new HashMap();
    this.statusCode = 200;
    this.statusText = 'OK';
    this.connected = false;

    this.close = sinon.stub();
    this.copy = sinon.stub();
    this.del = sinon.stub();
    this.get = sinon.stub();
    this.getBinary = sinon.stub();
    this.mkcol = sinon.stub();
    this.move = sinon.stub();
    this.options = sinon.stub();
    this.propfind = sinon.stub();
    this.put = sinon.stub();
    this.succeeded = sinon.stub();
  }

  addRequestHeader(headerName, headerValue) {
    this.allRequestHeaders.put(headerName, headerValue);
  }

  getResponseHeader(header) {
    return this.allResponseHeaders.get(header);
  }

  getAllResponseHeaders() {
    return this.allResponseHeaders;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getStatusText() {
    return this.statusText;
  }
}

WebDAVClient.DEFAULT_ENCODING = 'UTF-8';
WebDAVClient.DEFAULT_GET_FILE_SIZE = 5242880;
WebDAVClient.DEFAULT_GET_STRING_SIZE = 2097152;
WebDAVClient.DEPTH_0 = 0;
WebDAVClient.DEPTH_1 = 1;
WebDAVClient.DEPTH_INFINITY = 2147483647;
WebDAVClient.MAX_GET_FILE_SIZE = 209715200;
WebDAVClient.MAX_GET_STRING_SIZE = 10485760;

module.exports = WebDAVClient;
