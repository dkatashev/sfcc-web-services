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
      var svc = this._createService(alias);
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
   * @returns {dw.svc.Service} The created service instance.
   */
  _createService: function (alias) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var serviceDefinition = this._getServiceID(alias || 'default');
    var configCallbacks = this._getServiceCallback(serviceDefinition);

    return LocalServiceRegistry.createService(serviceDefinition, configCallbacks);
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

    return this.SERVICE_CONFIGURATIONS[alias];
  },

  /**
   * Prepares and returns service callback object.
   *
   * @protected
   * @returns {dw.svc.ServiceCallback} The service callback configurations.
   */
  _getServiceCallback: function () {
    var configCallbacks = {};
    var self = this;

    /** Prepare service callback */
    this.SERVICE_CALLBACK_METHODS.forEach(function (method) {
      if (typeof self[method] === 'function') {
        configCallbacks[method] = self[method].bind(self);
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
      var Result = require('dw/svc/Result');

      result = new Result();
      result.ok = false;
      result.errorMessage = result.message;
    }

    return serviceResult;
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
