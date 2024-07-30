'use strict';

/**
 * Abstract service object containing common methods for service interactions.
 */
var BaseService = {
  /**
   * Defines available service configurations.
   * @type {Object.<string, string>}
   */
  SERVICE_CONFIGURATIONS: {
    default: '',
  },

  /**
   * Names of callback methods that can be provided for configuring service behavior.
   * @type {string[]}
   */
  SERVICE_CALLBACK_METHODS: [
    'initServiceClient',
    'createRequest',
    'execute',
    'parseResponse',
    'filterLogMessage',
    'getRequestLogMessage',
    'getResponseLogMessage',
  ],

  /**
   * Names of callback methods that can be provided for configuring service mock behavior.
   * @type {string[]}
   */
  SERVICE_CALLBACK_MOCK_METHODS: ['mockCall', 'mockFull'],

  /**
   * Extend Service
   *
   * @template T
   * @param {T} service - extention of service
   */
  extend: function (service) {
    return Object.assign({}, this, service);
  },

  /**
   * Initiates a service operation based on the provided action and arguments.
   *
   * @param {string|Object.<string,any>} aliasOrArgs - The service alias to be used, or if not provided, the arguments.
   * @param {Object.<string,any>} [args] - The arguments for the fetch operation.
   * @returns {void}
   */
  fetch: function (aliasOrArgs, args) {
    var alias = args ? aliasOrArgs : 'default';
    var params = args || aliasOrArgs;
    var service;
    var result;

    try {
      service = this._createService(alias, params);
      result = service.call(params);

      return result.ok ? this._handleSuccessResult(result, service) : this._handleErrorResult(result, service);
    } catch (err) {
      return this._handleErrorResult(err, service);
    }
  },

  /**
   * Creates a service instance based on the provided service ID name.
   *
   * @protected
   * @param {string} [alias] - The service alias for which the service instance is created. Defaults to 'default'.
   * @param {Object.<string,any>} [params] - The arguments for the fetch operation.
   * @returns {dw.svc.Service} The created service instance.
   */
  _createService: function (alias, params) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var serviceId = this._getServiceID(alias || 'default');
    var configCallbacks = this._getServiceCallback(params);

    return LocalServiceRegistry.createService(serviceId, configCallbacks);
  },

  /**
   * Retrieves the configuration for a specific service alias.
   *
   * @protected
   * @param {string} alias - The service name for which the configuration is retrieved.
   * @returns {string} The configuration for the specified service name.
   * @throws {TypeError} Throws an error if the alias is not defined in SERVICE_CONFIGURATIONS.
   */
  _getServiceID: function (alias) {
    var serviceId = this.SERVICE_CONFIGURATIONS[alias];

    if (!serviceId) {
      throw new TypeError('Service: Please define service action for ' + alias + ' !');
    }

    return serviceId;
  },

  /**
   * Prepares and returns service callback object.
   *
   * @protected
   * @param {Object.<string,any>} [params] - The arguments for the fetch operation.
   * @returns {dw.svc.ServiceCallback} The service callback configurations.
   */
  _getServiceCallback: function (params) {
    var configCallbacks = {};
    var self = this;

    /** Prepare service callback common methods */
    this.SERVICE_CALLBACK_METHODS.forEach(function (method) {
      if (typeof self[method] === 'function') {
        configCallbacks[method] = self[method].bind(self);
      }
    });

    /** Prepare service callback mock methods */
    this.SERVICE_CALLBACK_MOCK_METHODS.forEach(function (method) {
      if (typeof params[method] === 'function') {
        configCallbacks[method] = params[method].bind(self);
      }
    });

    return configCallbacks;
  },

  /**
   * Transforms an error result into a structured service result.
   *
   * @protected
   * @param {dw.svc.Result | Error} serviceResult - The original service result or an error.
   * @param {dw.svc.Service} service - The service instance.
   * @returns {dw.svc.Result} The transformed service result.
   */
  // eslint-disable-next-line no-unused-vars
  _handleErrorResult: function (serviceResult, service) {
    var result = serviceResult;

    if (serviceResult instanceof Error) {
      result = {
        error: -1,
        errorMessage: result.message,
        msg: result.stack,
        object: null,
        ok: false,
        status: 'ERROR',
        unavailableReason: null,
      };
    }

    return result;
  },

  /**
   * Handles a successful service result.
   *
   * @protected
   * @param {dw.svc.Result} result - The successful service result.
   * @param {dw.svc.Service} service - The service instance.
   * @returns {dw.svc.Result} The input result.
   */
  // eslint-disable-next-line no-unused-vars
  _handleSuccessResult: function (result, service) {
    return result;
  },

  /**
   * Retrieves the service credential for the service.
   *
   * @param {dw.svc.Service} svc - The service instance.
   * @param {*} params - The service parameters.
   * @returns {dw.svc.ServiceCredential} The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _getServiceCredential: function (svc, params) {
    return svc.configuration.credential;
  },
};

module.exports = BaseService;
