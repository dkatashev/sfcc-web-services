'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');
/** @type {import('../util/contentType')} */
var contentType = require('*/cartridge/scripts/util/contentType');
/** @type {import('../util/urlencoded')} */
var urlencoded = require('*/cartridge/scripts/util/urlencoded');
/** @type {import('../util/multipart')} */
var multipart = require('*/cartridge/scripts/util/multipart');

/**
 * Represents a REST Service.
 */
var RestService = BaseService.extend({
  /**
   * Creates an HTTP request for the REST service.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {RestParams} params - The parameters for creating the request.
   * @returns {string|dw.net.HTTPRequestPart[]|undefined} The request body, if applicable.
   */
  createRequest: function (svc, params) {
    // Merge params with default values
    var defaults = {
      method: 'GET',
      pathPatterns: {},
      queryParams: {},
      headers: {},
    };
    var args = Object.assign(defaults, params);

    // Extract credential and URL
    var credential = this._getServiceCredential(svc, args);
    var url = credential.getURL();

    // Could be used to inject custom logic per call
    if (typeof args.onCreateRequest === 'function') {
      args.onCreateRequest(args, svc, credential);
    }

    // Set request method
    svc.setRequestMethod(args.method);

    /**
     * Replace path pattern with values
     * For example: https://test.com/:testParam
     */
    Object.keys(args.pathPatterns).forEach(function (pathParam) {
      url = url.replace(new RegExp(':' + pathParam), args.pathPatterns[pathParam]);
    });

    // Set service URL
    svc.setURL(url);

    /**
     * Add query param to URL
     * For example: https://test.com?param=value
     */
    Object.keys(args.queryParams).forEach(function (queryParam) {
      svc.addParam(queryParam, args.queryParams[queryParam]);
    });

    /**
     * Add header to request
     * For example: Accept: application/json
     */
    Object.keys(args.headers).forEach(function (header) {
      svc.addHeader(header, args.headers[header]);
    });

    // Set HTTP Authorization
    if (typeof args.getAuthentication === 'function') {
      args.auth = args.getAuthentication(args, svc, credential);
    }

    // Set HTTP Authorization Header
    if (args.auth) {
      this._setAuthorizationHeader(svc, args.auth);
    }

    // Sets the output file in which to write the HTTP response body.
    if (args.outFile) {
      svc.setOutFile(args.outFile);
    }

    // Sets the identity (private key) to use when mutual TLS (mTLS) is configured.
    if (args.keyRef) {
      svc.setIdentity(args.keyRef);
    }

    // Sets the encoding of the request body.
    if (args.encoding) {
      svc.setEncoding(args.encoding);
    }

    // Enables caching for GET requests.
    if (args.ttl) {
      svc.setCachingTTL(args.ttl);
    }

    // Restrict request body by request method
    if (args.method === 'GET') {
      return undefined;
    }

    // Create request body with appropriate content-type header
    return this._createRequestBody(svc, args.dataType, args.data);
  },

  /**
   * Set custom Authorization header and disable Basic Authentication.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Authentication} auth - The authentication configuration.
   */
  _setAuthorizationHeader: function (svc, auth) {
    svc.setAuthentication('NONE');

    if (auth.type && auth.credentials) {
      svc.addHeader('Authorization', auth.type + ' ' + auth.credentials);
    }
  },

  /**
   * Transform data object to string or use dw.net.HTTPRequestPart[].
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {RestParams['dataType']} dataType - The type of data being sent.
   * @param {*} data - The data to be sent in the request.
   * @returns {string|dw.net.HTTPRequestPart[]} The formatted request body.
   */
  _createRequestBody: function (svc, dataType, data) {
    switch (dataType) {
      case 'form':
        return this._createFormBody(svc, data);
      case 'xml':
        return this._createXmlBody(svc, data);
      case 'multipart':
        return this._createMultipartBody(svc, data);
      case 'mixed':
        return this._createMixedBody(svc, data);
      default:
        return this._createJsonBody(svc, data);
    }
  },

  /**
   * Transform data object to URI-encoded string.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   * @returns {string} The formatted form body.
   */
  _createFormBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');

    return urlencoded.format(data);
  },

  /**
   * Transform data object to JSON string.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   * @returns {string} The formatted JSON body.
   */
  _createJsonBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/json');

    return JSON.stringify(data);
  },

  /**
   * Transform data object to XML string.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   * @returns {string} The formatted XML body.
   */
  _createXmlBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/xml');

    if (data instanceof XML) {
      return data.toXMLString();
    }

    return data.toString();
  },

  /**
   * Prepare multipart/form-data body.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {dw.net.HTTPRequestPart[]} data - The multipart data.
   * @returns {dw.net.HTTPRequestPart[]} The multipart request parts.
   */
  _createMultipartBody: function (svc, data) {
    var HTTPRequestPart = require('dw/net/HTTPRequestPart');
    var isHTTPRequestPart = function (part) {
      return part instanceof HTTPRequestPart;
    };

    if (!Array.isArray(data) || !data.every(isHTTPRequestPart)) {
      throw new TypeError('Incorrect "data". It should be array of dw.net.HTTPRequestPart.');
    }

    // Content type will be set to multipart/form-data and boundary created automagically.
    return data;
  },

  /**
   * Prepare multipart/mixed body.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object} data - The multipart data.
   * @param {string} data.boundary - The multipart boundary.
   * @param {MultipartChunk[]} data.parts - The multipart parts.
   * @returns {string} The formatted multipart body.
   */
  _createMixedBody: function (svc, data) {
    var contentTypeHeader = contentType.format({
      type: 'multipart/mixed',
      params: {
        boundary: data.boundary
      }
    });

    svc.addHeader('Content-Type', contentTypeHeader);

    return multipart.format(data.boundary, data.parts);
  },

  /**
   * Parses the HTTP response for the REST service.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {dw.net.HTTPClient} response - The HTTP response.
   * @returns {string|Object} The parsed response content.
   */
  parseResponse: function (svc, response) {
    var contentTypeHeader = response.getResponseHeader('Content-Type') || '';
    var contentTypeObject = contentType.parse(contentTypeHeader);

    return this._parseResponseBody(contentTypeObject, response);
  },

  /**
   * Parses the HTTP response body for the REST service.
   *
   * @param {ContentType} contentTypeObject - The content type object.
   * @param {dw.net.HTTPClient} response - The HTTP response.
   * @returns {string|Object} The parsed response content.
   */
  _parseResponseBody: function (contentTypeObject, response) {
    switch (contentTypeObject.type) {
      case 'application/json':
        return JSON.parse(response.text);
      case 'application/xml':
      case 'text/xml':
        return new XML(response.text);
      case 'application/x-www-form-urlencoded':
        return urlencoded.parse(response.text);
      case 'multipart/mixed':
        return this._parseResponseMultipart(contentTypeObject.params.boundary, response.text);
      case 'application/octet-stream':
        return response.bytes;
      default:
        return response.text;
    }
  },

  /**
   * Parses the HTTP response multipart body for the REST service.
   *
   * @param {string} boundary - The multipart boundary.
   * @param {string} responseText - The HTTP response body text.
   * @returns {MultipartChunk[]} The parsed multipart chunks.
   */
  _parseResponseMultipart: function (boundary, responseText) {
    var Bytes = require('dw/util/Bytes');

    return multipart.parse(boundary, responseText).map(function (part) {
      var partContentTypeHeader = part.headers['content-type'] || 'text/plain';
      var partContentTypeObject = contentType.parse(partContentTypeHeader);

      part.body = this._parseResponseBody(partContentTypeObject, {
        text: part.body,
        bytes: new Bytes(part.body)
      });

      return part;
    }, this);
  }
});

/**
 * @typedef {import('../util/contentType').ContentType} ContentType
 */

/**
 * @typedef {import('../util/multipart').MultipartChunk} MultipartChunk
 */

/**
 * Represents an authentication configuration.
 * @typedef {Object} Authentication
 * @property {string} type - The type of authentication.
 * @property {string} credentials - The authentication credentials.
 */

/**
 * Callback function for producing Authentication credentials.
 * @callback getAuthentication
 * @param {RestParams} params - The REST parameters.
 * @param {dw.svc.HTTPService} svc - The service instance.
 * @param {dw.svc.ServiceCredential} serviceCredential - The service credential.
 * @returns {Authentication}
 */

/**
 * Callback function for customizing the REST request.
 * @callback onCreateRequest
 * @param {RestParams} params - The REST parameters.
 * @param {dw.svc.HTTPService} svc - The service instance.
 * @param {dw.svc.ServiceCredential} serviceCredential - The service credential.
 * @returns {void}
 */

/**
 * Represents parameters for the REST service.
 * @typedef {Object} RestParams
 * @property {"GET" | "PUT" | "POST" | "DELETE"} [method] - The HTTP method.
 * @property {Authentication} [auth] - The authentication configuration.
 * @property {Object.<string,string>} [pathPatterns] - The path pattern replacements.
 * @property {Object.<string,string>} [queryParams] - The query parameters.
 * @property {Object.<string,string>} [headers] - The request headers.
 * @property {('form'|'json'|'xml'|'multipart'|'mixed')} [dataType] - The type of data being sent.
 * @property {*} [data] - The data to be sent in the request.
 * @property {dw.io.File} [outFile] - The output file for the response body.
 * @property {dw.crypto.KeyRef} [keyRef] - The key reference for mutual TLS.
 * @property {string} [encoding] - The encoding of the request body.
 * @property {number} [ttl] - The time-to-live for caching GET requests.
 * @property {getAuthentication} [getAuthentication] - Callback for customizing the authentication object.
 * @property {onCreateRequest} [onCreateRequest] - Callback for customizing the request.
 */

module.exports = RestService;
