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
   * @param {WebDAVService} svc - The WebDAV service instance.
   * @param {WebdavParams} params - The parameters for creating the request.
   * @returns {WebdavParams} The input parameters.
   */
  createRequest: function (svc, params) {
    var WebDAVClient = require('dw/net/WebDAVClient');

    var credential = this._getServiceCredential(svc, params);
    var url = credential.getURL();
    var defaults = {
      headers: {},
      pathPatterns: {},
    };
    var args = Object.assign(defaults, params);

    // Could be used to inject custom logic per call
    if (typeof args.onCreateRequest === 'function') {
      args.onCreateRequest(args, svc, credential);
    }

    /**
     * @description Replace path pattern with values
     * @example https://test.com/:testParam
     */
    Object.keys(args.pathPatterns).forEach(function (pathParam) {
      url = url.replace(new RegExp(':' + pathParam), args.pathPatterns[pathParam]);
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
    Object.keys(args.headers).forEach(function (header) {
      svc.client.addRequestHeader(header, args.headers[header]);
    });

    return params;
  },

  /**
   * Executes the WebDAV service operations.
   *
   * @param {WebDAVService} svc - The WebDAV service instance.
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

      return result;
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

      return result;
    }

    client.close();
    throw new Error('No valid operation or callback provided.');
  },

  /**
   * Parses the response from the WebDAV service and close client.
   *
   * @param {WebDAVService} svc - The WebDAV service instance.
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
});

/**
 * @typedef {dw.svc.Service & {client: dw.svc.WebDAVClient}} WebDAVService
 */

/**
 * Callback function for executing WebDAV operations.
 * @callback onExecute
 * @param {WebDAVService} svc - The FTP service instance.
 * @returns {*} The result of the executed operations.
 */

/**
 * Callback function for customizing the WebDAV request.
 * @callback onCreateRequest
 * @param {WebdavParams} params - The REST parameters.
 * @param {WebDAVService} svc - The service instance.
 * @param {dw.svc.ServiceCredential} serviceCredential - The service credential.
 * @returns {void}
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
