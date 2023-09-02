'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * Represents a REST Service.
 */
var RestService = BaseService.extend({
  /**
   * Creates an HTTP request for the REST service.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {RestParams} params - The parameters for creating the request.
   * @returns {string|undefined} The request body, if applicable.
   */
  createRequest: function (svc, params) {
    var credential = this._getServiceCredential(svc, params);
    var url = credential.getURL();
    var pathPatterns = params.pathPatterns || {};
    var queryParams = params.queryParams || {};
    var headers = params.headers || {};
    var body = '';

    /** @description HTTP Method */
    svc.setRequestMethod(params.method || 'GET');

    /**
     * @description Replace path pattern with values
     * @example https://test.com/:testParam
     */
    Object.keys(pathPatterns).forEach(function (pathParam) {
      url = url.replace(new RegExp(':' + pathParam), pathPatterns[pathParam]);
    });

    svc.setURL(url);

    /**
     * @description Add query param to URL
     * @example https://test.com?param=value
     */
    Object.keys(queryParams).forEach(function (queryParam) {
      svc.addParam(queryParam, queryParams[queryParam]);
    });

    /**
     * @description Add header to request
     * @example Accept: application/json
     */
    Object.keys(headers).forEach(function (header) {
      svc.addHeader(header, headers[header]);
    });

    /** @description HTTP Authorization */
    if (params.auth) {
      this._setAuthorizationHeader(params, credential);
    }

    /**
     * Sets the output file in which to write the HTTP response body.
     */
    if (params.outFile) {
      svc.setOutFile(params.outFile);
    }

    /**
     * Sets the identity (private key) to use when mutual TLS (mTLS) is configured.
     */
    if (params.keyRef) {
      svc.setIdentity(params.keyRef);
    }

    /**
     * Sets the encoding of the request body (if any).
     */
    if (params.encoding) {
      svc.setEncoding(params.encoding);
    }

    /**
     * Enables caching for GET requests.
     */
    if (params.ttl) {
      svc.setCachingTTL(params.ttl);
    }

    // Could be used to inject custom logic per call
    if (typeof params.onCreateRequest === 'function') {
      params.onCreateRequest(params, svc, credential);
    }

    /** @description Restrict request body by request method */
    if (params.method === 'GET') {
      return undefined;
    }

    /** @description Convert data to string */
    switch (params.dataType) {
      case 'form':
        body = this._createFormBody(svc, params.data);
        break;
      case 'xml':
        body = this._createXMLBody(svc, params.data);
        break;
      default:
        body = this._createJSONBody(svc, params.data);
        break;
    }

    return body;
  },

  /**
   * Parses the HTTP response for the REST service.
   *
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object} response - The HTTP response.
   * @returns {string|Object} The parsed response content.
   */
  parseResponse: function (svc, response) {
    var contentType = this._getResponseContentType(svc);

    switch (contentType.type) {
      case 'application/json':
        return JSON.parse(response.text);
      case 'application/xml':
      case 'text/xml':
        return new XML(response.text);
      case 'application/x-www-form-urlencoded':
        return this._parseFormBody(response.text);
      default:
        return response.text;
    }
  },

  /**
   * Retrieves the content type from the HTTP response.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @returns {{type: string, encoding: string}} The content type and encoding.
   */
  _getResponseContentType: function (svc) {
    var header = svc.client.getResponseHeader('Content-Type') || '';
    var matched = header.split(';').map(function (value) {
      return value.trim();
    });

    return {
      type: matched[0],
      encoding: matched[1] || 'UTF-8'
    };
  },

  /**
   * Retrieves the service credential for the REST service.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {RestParams} params - The REST parameters.
   * @returns {dw.svc.ServiceCredential} The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _getServiceCredential: function (svc, params) {
    return svc.configuration.credential;
  },

  /**
   * Sets the Authorization header for the HTTP request.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {RestParams} params - The REST parameters.
   * @param {dw.svc.ServiceCredential} credential - The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _setAuthorizationHeader: function (svc, params, credential) {
    var auth = params.auth;

    svc.setAuthentication('NONE');
    svc.addHeader('Authorization', auth.type + ' ' + auth.credentials);
  },

  /**
   * Encodes a string for use in a URI.
   *
   * @protected
   * @param {string} str - The string to be encoded.
   * @returns {string} The encoded string.
   */
  _encodeURI: function (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  },

  /**
   * Decodes a URI-encoded string.
   *
   * @protected
   * @param {string} str - The URI-encoded string to be decoded.
   * @returns {string} The decoded string.
   */
  _decodeURI: function (str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
  },

  /**
   * Transform data object to URI-encoded string.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   */
  _createFormBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');

    return Object.keys(data).map(function (key) {
      return [
        this._encodeURI(key),
        this._encodeURI(data[key])
      ].join('=');
    }, this).join('&');
  },

  /**
   * Transform data object to JSON string.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   */
  _createJSONBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/json');

    return JSON.stringify(data);
  },

  /**
   * Transform data object to XML string.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   */
  _createXMLBody: function (svc, data) {
    svc.addHeader('Content-Type', 'application/xml');

    if (data instanceof XML) {
      return data.toXMLString();
    }

    return data.toString();
  },

  /**
   * Transform body response to data object.
   *
   * @protected
   * @param {dw.svc.HTTPService} svc - The HTTP service instance.
   * @param {Object.<string,string>} data - The body data.
   */
  _parseFormBody: function (text) {
    var self = this;

    return text.split('&').reduce(function (state, next) {
      var pairs = next.split('=');
      var key = self._decodeURI(pairs[0]);
      var value = self._decodeURI(pairs[1]);

      state[key] = value;

      return state;
    }, {});
  }
});

/**
 * Represents an authentication configuration.
 * @typedef {Object} Authentication
 * @property {string} type - The type of authentication.
 * @property {string} credentials - The authentication credentials.
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
 * @property {('form'|'json'|'xml')} [dataType] - The type of data being sent.
 * @property {*} [data] - The data to be sent in the request.
 * @property {dw.io.File} [outFile] - The output file for the response body.
 * @property {dw.crypto.KeyRef} [keyRef] - The key reference for mutual TLS.
 * @property {string} [encoding] - The encoding of the request body.
 * @property {number} [ttl] - The time-to-live for caching GET requests.
 * @property {onCreateRequest} [onCreateRequest] - Callback for customizing the request.
 */

module.exports = RestService;
