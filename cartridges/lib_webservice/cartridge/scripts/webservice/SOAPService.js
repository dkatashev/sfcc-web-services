'use strict';

var WSUtil = require('dw/ws/WSUtil');

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * Represents a SOAP Service.
 */
var SOAPService = BaseService.extend({
  /** @type {SOAPState} */
  state: {
    webReference: null,
    webReferencePort: null,
    operation: null
  },

  /**
   * Creates a SOAP request based on the provided parameters.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPParams} params - The parameters for creating the SOAP request.
   * @returns {*} The SOAP request.
   */
  createRequest: function (svc, params) {
    this.state.webReference = webreferences2[params.webReference];
    this.state.webReferencePort = params.service
      ? this.state.webReference.getService(params.service.name, params.service.port)
      : this.state.webReference.defaultService;
    this.state.operation = params.operation;

    svc.setServiceClient(this.state.webReferencePort);

    this._addSOAPHeaders(svc, params.soapHeaders);
    this._setHTTPHeaders(svc, params.httpHeaders);
    this._setWSSecurityConfig(svc, params.securityConfig);
    this._setProperties(svc, params.properties);

    if (typeof params.onCreateRequest === 'function') {
      params.onCreateRequest(params, svc);
    }

    var request = params.getRequest(svc, this.state.webReference);

    return request;
  },

  /**
   * Executes the SOAP service request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {*} requestObject - The request object.
   * @returns {*} The response object.
   */
  execute: function (svc, requestObject) {
    return svc.serviceClient[this.state.operation](requestObject);
  },

  /**
   * Parses the SOAP service response.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {*} responseObject - The response object.
   * @returns {*} The parsed response.
   */
  parseResponse: function (svc, responseObject) {
    return responseObject;
  },

  /**
   * Adds SOAP headers to the request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPHeader[]} soapHeaders - The SOAP headers collection.
   * @protected
   */
  _addSOAPHeaders: function (svc, soapHeaders) {
    if (Array.isArray(soapHeaders)) {
      soapHeaders.forEach(function (soapHeader) {
        WSUtil.addSOAPHeader(
          svc.serviceClient,
          soapHeader.header,
          soapHeader.mustUnderstand,
          soapHeader.actor
        );
      });
    }
  },

  /**
   * Sets HTTP headers for the request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {Object.<string,string>} httpHeaders - The HTTP headers object.
   * @protected
   */
  _setHTTPHeaders: function (svc, httpHeaders) {
    if (httpHeaders !== null && typeof httpHeaders === 'object') {
      Object.keys(httpHeaders).forEach(function (header) {
        WSUtil.setHTTPRequestHeader(svc.serviceClient, header, httpHeaders[header]);
      });
    }
  },

  /**
   * Sets WS-Security configuration for the request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SecurityConfig} securityConfig - The security configuration.
   * @protected
   */
  _setWSSecurityConfig: function (svc, securityConfig) {
    if (securityConfig && securityConfig.requestConfigMap && securityConfig.responseConfigMap) {
      WSUtil.setWSSecurityConfig(
        svc.serviceClient,
        securityConfig.requestConfigMap,
        securityConfig.responseConfigMap
      );
    }
  },

  /**
   * Sets SOAP properties for the request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPProperties} properties - The SOAP properties.
   * @protected
   */
  _setProperties: function (svc, properties) {
    var Port = require('dw/ws/Port');

    if (properties !== null && typeof properties === 'object') {
      Object.keys(properties).forEach(function (property) {
        switch (property) {
          case 'encoding':
            WSUtil.setProperty(Port.ENCODING, properties[property], svc.serviceClient);
            break;
          case 'session':
            WSUtil.setProperty(Port.SESSION_MAINTAIN_PROPERTY, properties[property], svc.serviceClient);
            break;
          default:
            break;
        }
      });
    }
  }
});

/**
 * Represents state for the SOAP service.
 * @typedef {Object} SOAPState
 * @property {dw.ws.WebReference2} webReference - The WebReference object.
 * @property {dw.ws.Port} webReferencePort - The Port object.
 * @property {string} operation - The operation being performed.
 */

/**
 * Represents parameters for the SOAP service.
 * @typedef {Object} SOAPHeader
 * @property {string|XML} header - The SOAP header content.
 * @property {boolean} mustUnderstand - Indicates if the header must be understood.
 * @property {string} actor - The actor for the header.
 */

/**
 * Callback function for customizing the SOAP request.
 * @callback onCreateRequest
 * @param {SOAPParams} params - The SOAP parameters.
 * @param {dw.svc.SOAPService} svc - The service instance.
 * @param {dw.svc.ServiceCredential} serviceCredential - The service credential.
 * @returns {void}
 */

/**
 * Callback function for the creation of the SOAP request.
 * @callback getRequest
 * @param {dw.svc.SOAPService} svc - The SOAP service instance.
 * @param {dw.ws.WebReference2} webReference - The WebReference object.
 * @returns {Object}
 */

/**
 * Represents parameters for the SOAP service.
 * @typedef {Object} SOAPParams
 * @property {string} webReference - The web reference for the SOAP service.
 * @property {Object} [service] - Service details.
 * @property {string} service.name - The service name.
 * @property {string} service.port - The service port.
 * @property {string} operation - The SOAP operation.
 * @property {SOAPHeader[]} [soapHeaders] - An array of SOAP headers.
 * @property {Object.<string,string>} [httpHeaders] - HTTP headers.
 * @property {SecurityConfig} [securityConfig] - Security configuration.
 * @property {SOAPProperties} [properties] - SOAP properties.
 * @property {onCreateRequest} [onCreateRequest] - Custom request creation callback.
 * @property {getRequest} getRequest - Get request callback.
 */

/**
 * Represents security configuration.
 * @typedef {Object} SecurityConfig
 * @property {dw.util.HashMap} requestConfigMap - Request configuration map.
 * @property {dw.util.HashMap} responseConfigMap - Response configuration map.
 */

/**
 * Represents SOAP properties.
 * @typedef {Object} SOAPProperties
 * @property {dw.util.HashMap} encoding - The encoding.
 * @property {dw.util.HashMap} session - Session flag.
 */

module.exports = SOAPService;
