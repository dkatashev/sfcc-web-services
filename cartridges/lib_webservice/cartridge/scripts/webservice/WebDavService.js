'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * Represents a WebDAV Service.
 */
var WebDavService = BaseService.extend({
  /**
   * Creates a request for the WebDAV service.
   *
   * @param {dw.svc.Service & {client: dw.net.WebDAVClient}} svc - The WebDAV service instance.
   * @param {WebdavParams} params - The parameters for creating the request.
   * @returns {WebdavParams} The input parameters.
   */
  createRequest: function (svc, params) {
    var WebDAVClient = require('dw/net/WebDAVClient');

    var credential = this._getServiceCredential(svc, params);
    var url = credential.getURL();
    var headers = params.headers || {};
    var pathPatterns = params.pathPatterns || {};

    /**
     * @description Replace path pattern with values
     * @example https://test.com/:testParam
     */
    Object.keys(pathPatterns).forEach(function (pathParam) {
      url = url.replace(new RegExp(':' + pathParam), pathPatterns[pathParam]);
    });

    svc.setURL(url);

    /**
     * Inject dw.net.WebDAVClient to svc object
     */
    if (credential.user && credential.password) {
      svc.client = new WebDAVClient(svc.URL, credential.user, credential.password);
    } else {
      svc.client = new WebDAVClient(svc.URL);
    }

    /**
     * @description Add header to request
     * @example Accept: application/json
     */
    Object.keys(headers).forEach(function (header) {
      svc.client.addRequestHeader(header, headers[header]);
    });

    return params;
  },

  /**
   * Executes the WebDAV service operations.
   *
   * @param {dw.svc.Service & {client: dw.net.WebDAVClient}} svc - The WebDAV service instance.
   * @param {WebdavParams} params - The parameters for executing the operations.
   * @returns {*} The result of the executed operation.
   * @throws {Error} If the WebDAV call fails.
   */
  execute: function (svc, params) {
    var client = svc.client;
    var result;

    /**
     * Useful for a single operation, such as download file
     */
    if (params.operation && params.args) {
      try {
        result = client[params.operation].apply(client, params.args);
      } finally {
        client.close();
      }
    }

    /**
     * Useful to make multiple operations
     */
    if (typeof params.onExecute === 'function') {
      try {
        result = params.onExecute(svc);
      } finally {
        client.close();
      }
    }

    return result;
  },

  /**
   * Parses the response from the WebDAV service and close client.
   *
   * @param {dw.svc.Service & {client: dw.net.WebDAVClient}} svc - The WebDAV service instance.
   * @param {*} response - The response to parse.
   * @returns {*} The parsed response.
   */
  parseResponse: function (svc, response) {
    var client = svc.client;

    /**
     * Handle WebDAV call failure
     */
    if (!client.succeeded()) {
      var error = new Error(client.statusText);
      client.close();
      throw error;
    }

    client.close();

    return response;
  },

  /**
   * Retrieves the service credential for the WebDAV service.
   *
   * @private
   * @param {dw.svc.Service & {client: dw.svc.WebDAVClient}} svc - The WebDAV service instance.
   * @param {RequestParams} params - The WebDAV parameters.
   * @returns {dw.svc.ServiceCredential} The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _getServiceCredential: function (svc, params) {
    return svc.configuration.credential;
  }
});

/**
 * Callback function for executing WebDAV operations.
 * @callback onExecute
 * @param {dw.svc.Service & {client: dw.svc.WebDAVClient}} svc - The FTP service instance.
 * @returns {*} The result of the executed operations.
 */

/**
 * Represents parameters for the WebDAV service.
 * @typedef {Object} WebdavParams
 * @property {Object.<string,string>} [pathPatterns] - Patterns to replace in the URL.
 * @property {Object.<string,string>} [headers] - Headers for the request.
 * @property {'copy'|'del'|'get'|'getBinary'|'mkcol'|'move'|'options'|'propfind'|'put'} [operation] - The WebDAV operation to be executed.
 * @property {*[]} [args] - The arguments for the operation.
 * @property {onExecute} [onExecute] - Callback for executing multiple operations.
 */

module.exports = WebDavService;
