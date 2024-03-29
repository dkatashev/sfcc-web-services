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
    default: ''
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
    'getResponseLogMessage'
  ],

  /**
   * Names of callback methods that can be provided for configuring service mock behavior.
   * @type {string[]}
   */
  SERVICE_CALLBACK_MOCK_METHODS: [
    'mockCall',
    'mockFull'
  ],

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

    try {
      var svc = this._createService(alias, params);
      var result = svc.call(params);

      if (!result.ok) {
        return this._handleErrorResult(result);
      }

      return this._handleSuccessResult(result);
    } catch (err) {
      return this._handleErrorResult(err);
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
   * @returns {ServiceAction} The configuration for the specified service name.
   * @throws {TypeError} Throws an error if the alias is not defined in SERVICE_CONFIGURATIONS.
   */
  _getServiceID: function (alias) {
    var serviceAction = this.SERVICE_CONFIGURATIONS[alias];

    if (!serviceAction) {
      throw new TypeError('Service: Please define service action for ' + alias + ' !');
    }

    return serviceAction;
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

    /** Prepare service callback */
    this.SERVICE_CALLBACK_METHODS.forEach(function (method) {
      if (typeof self[method] === 'function') {
        configCallbacks[method] = self[method].bind(self);
      }
    });

    /** Prepare service mock callbacks */
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
   * @returns {dw.svc.Result} The transformed service result.
   */
  _handleErrorResult: function (serviceResult) {
    var result = serviceResult;

    if (serviceResult instanceof Error) {
      result = {
        error: -1,
        errorMessage: result.message,
        msg: result.stack,
        object: null,
        ok: false,
        status: 'ERROR',
        unavailableReason: null
      };
    }

    return result;
  },

  /**
   * Handles a successful service result.
   *
   * @protected
   * @param {dw.svc.Result} result - The successful service result.
   * @returns {dw.svc.Result} The input result.
   */
  _handleSuccessResult: function (result) {
    return result;
  }
};

module.exports = BaseService;
