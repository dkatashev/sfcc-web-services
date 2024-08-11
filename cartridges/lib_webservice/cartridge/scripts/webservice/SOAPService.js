'use strict';

var Port = require('dw/ws/Port');
var WSUtil = require('dw/ws/WSUtil');

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * Represents a SOAP Service.
 */
var SOAPService = BaseService.extend({
  PROPERTY_MAPPING: {
    encoding: Port.ENCODING,
    endpoint: Port.ENDPOINT_ADDRESS_PROPERTY,
    session: Port.SESSION_MAINTAIN_PROPERTY,
    username: Port.USERNAME_PROPERTY,
    password: Port.PASSWORD_PROPERTY,
  },

  /**
   * Creates a SOAP request based on the provided parameters.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPParams} params - The parameters for creating the SOAP request.
   * @returns {*} The SOAP request.
   */
  createRequest: function (svc, params) {
    var credential = this._getServiceCredential(svc);
    var args = Object.assign({
      soapHeaders: [],
      httpHeaders: {},
      securityConfig: {},
      properties: {},
    }, params);

    this._initializeService(svc, args);

    if (typeof args.onCreateRequest === 'function') {
      args.onCreateRequest(args, svc, credential);
    }

    this._configureService(svc, args);

    return args.createRequestPayload(svc, svc.webReference);
  },

  /**
   * Initializes the service with basic configurations.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPParams} args - The SOAP parameters.
   * @protected
   */
  _initializeService: function (svc, args) {
    var webReference = webreferences2[args.webReference];
    var webReferencePort;

    if (args.service) {
      webReferencePort = webReference.getService(args.service.name, args.service.port);
    } else {
      webReferencePort = webReference.defaultService;
    }

    svc.webReference = webReference;
    svc.setServiceClient(webReferencePort);
    svc.operation = args.operation;
    svc.executeRequest = args.executeRequest;
    svc.parseResponsePayload = args.parseResponsePayload;
  },

  /**
   * Sets the configurations for the service.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {SOAPParams} args - The SOAP parameters.
   * @protected
   */
  _configureService: function (svc, args) {
    var self = this;

    args.soapHeaders.forEach(function (soapHeader) {
      WSUtil.addSOAPHeader(
        svc.serviceClient,
        soapHeader.header,
        soapHeader.mustUnderstand,
        soapHeader.actor
      );
    });

    Object.keys(args.httpHeaders).forEach(function (header) {
      WSUtil.setHTTPRequestHeader(
        svc.serviceClient,
        header,
        args.httpHeaders[header]
      );
    });

    if (args.securityConfig.requestConfigMap && args.securityConfig.responseConfigMap) {
      WSUtil.setWSSecurityConfig(
        svc.serviceClient,
        args.securityConfig.requestConfigMap,
        args.securityConfig.responseConfigMap
      );
    }

    Object.keys(args.properties).forEach(function (property) {
      if (self.PROPERTY_MAPPING[property]) {
        WSUtil.setProperty(
          self.PROPERTY_MAPPING[property],
          args.properties[property],
          svc.serviceClient
        );
      }
    });
  },

  /**
   * Executes the SOAP service request.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {Object} requestPayload - The request object.
   * @returns {Object} The response object.
   */
  execute: function (svc, requestPayload) {
    if (typeof svc.executeRequest === 'function') {
      return svc.executeRequest(svc, requestPayload);
    }

    var method = svc.serviceClient[svc.operation];
    return method.call(svc.serviceClient, requestPayload);
  },

  /**
   * Parses the SOAP service response.
   *
   * @param {dw.svc.SOAPService} svc - The SOAP service instance.
   * @param {Object} responsePayload - The response object.
   * @returns {Object} The parsed response.
   */
  parseResponse: function (svc, responsePayload) {
    if (typeof svc.parseResponsePayload === 'function') {
      return svc.parseResponsePayload(svc, responsePayload);
    }

    return responsePayload;
  }
});

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
 * Callback function for the creation of the SOAP request payload.
 * @callback createRequestPayload
 * @param {dw.svc.SOAPService} svc - The SOAP service instance.
 * @param {dw.ws.WebReference2} webReference - The WebReference object.
 * @returns {Object}
 */

/**
 * Callback function for the execution of the SOAP request.
 * @callback executeRequest
 * @param {dw.svc.SOAPService} svc - The SOAP service instance.
 * @param {Object} requestPayload - The SOAP request object.
 * @returns {Object}
 */

/**
 * Callback function for the parsing of the SOAP response payload.
 * @callback parseResponsePayload
 * @param {dw.svc.SOAPService} svc - The SOAP service instance.
 * @param {Object} responseObject - The SOAP response object.
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
 * @property {createRequestPayload} createRequestPayload - Create request payload callback.
 * @property {executeRequest} [executeRequest] - Execute request callback.
 * @property {parseResponsePayload} [parseResponsePayload] - Parse response payload callback.
 * @property {onCreateRequest} [onCreateRequest] - Custom request creation callback.
 * @property {SOAPHeader[]} [soapHeaders] - An array of SOAP headers.
 * @property {Object.<string,string>} [httpHeaders] - HTTP headers.
 * @property {SecurityConfig} [securityConfig] - Security configuration.
 * @property {SOAPProperties} [properties] - SOAP properties.
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
 * @property {string} encoding - The encoding.
 * @property {string} endpoint - The target service endpoint address.
 * @property {boolean} session - Session flag.
 * @property {boolean} username - Username flag.
 * @property {boolean} password - Password flag.
*/

module.exports = SOAPService;
