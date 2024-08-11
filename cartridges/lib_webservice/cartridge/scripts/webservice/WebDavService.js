'use strict';

/** @type {import('../util/urlencoded')} */
var urlencoded = require('*/cartridge/scripts/util/urlencoded');
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
    var url = credential.URL;
    var args = Object.assign({
      headers: {},
      pathPatterns: {},
      queryParams: {},
    }, params);

    // Could be used to inject custom logic per call
    if (typeof args.onCreateRequest === 'function') {
      args.onCreateRequest(args, svc, credential);
    }

    // Build the complete URL with path and query parameters
    url = this._buildCompleteUrl(url, args);
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
     * Add header to request
     * For example Accept: application/json
     */
    Object.keys(args.headers).forEach(function (header) {
      svc.client.addRequestHeader(header, args.headers[header]);
    });

    return args;
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

    try {
      if (params.operation && params.args) {
        result = client[params.operation].apply(client, params.args);
      } else if (typeof params.onExecute === 'function') {
        result = params.onExecute(svc);
      } else {
        throw new Error('No valid operation or callback provided.');
      }
    } finally {
      client.close();
    }

    return result;
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

    try {
      if (!client.succeeded()) {
        throw new Error(client.statusText);
      }

      return response;
    } finally {
      client.close();
    }
  },

  /**
   * Complete a URL with replaced path patterns and appended query parameters.
   *
   * @param {string} url - The base URL.
   * @param {Object} params - The parameters containing path patterns and query parameters.
   * @param {Object.<string, string>} params.pathPatterns - The parameters containing path patterns.
   * @param {Object.<string, string>} params.queryParams - The parameters containing query parameters.
   * @returns {string} The complete URL.
   */
  _buildCompleteUrl: function (url, params) {
    // Replace path patterns
    Object.keys(params.pathPatterns).forEach(function (pathParam) {
      url = url.replace(new RegExp(':' + pathParam), params.pathPatterns[pathParam]);
    });

    // Extract existing query string from URL
    var queryStringIndex = url.indexOf('?');
    var currentQueryString = queryStringIndex > -1 ? url.substring(queryStringIndex + 1) : '';

    // Parse existing query string and merge with new query parameters
    var currentQueryParams = urlencoded.parse(currentQueryString);
    var mergedQueryParams = Object.assign(currentQueryParams, params.queryParams);

    // Generate new query string
    var queryString = urlencoded.format(mergedQueryParams);

    // Reconstruct URL with new query string
    if (queryString) {
      var urlWithoutQueryString = queryStringIndex > -1 ? url.substring(0, queryStringIndex) : url;
      url = urlWithoutQueryString + '?' + queryString;
    }

    return url;
  },
});

/**
 * @typedef {dw.svc.Service & {client: dw.net.WebDAVClient}} WebDAVService
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
 * @property {Object.<string,string>} [queryParams] - The query parameters.
 * @property {Object.<string,string>} [headers] - Headers for the request.
 * @property {'copy'|'del'|'get'|'getBinary'|'mkcol'|'move'|'options'|'propfind'|'put'} [operation] - The WebDAV operation to be executed.
 * @property {*[]} [args] - The arguments for the operation.
 * @property {onExecute} [onExecute] - Callback for executing multiple operations.
 */

module.exports = WebDavService;
