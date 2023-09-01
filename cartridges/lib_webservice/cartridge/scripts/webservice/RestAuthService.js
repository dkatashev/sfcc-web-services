'use strict';

/** @type {import('./RestService')} */
var RestService = require('*/cartridge/scripts/webservice/RestService');

/**
 * Represents a REST Service with Authorization
 */
var RestAuthService = RestService.extend({
  /**
   * Defines available service configurations for the authorized REST service.
   * @type {Object.<string, string>}
   */
  SERVICE_CONFIGURATIONS: {
    default: '',
    auth: ''
  },

  /**
   * ID of the custom cache used to store access tokens.
   * @type {string}
   */
  CACHE_ID: '',

  /**
   * Performs authorization using the 'auth' service action.
   *
   * @returns {dw.svc.Result} The result of the authorization request.
   */
  authorize: function () {
    return this.fetch('auth', {
      method: 'POST',
      dataType: 'form',
      data: {
        grant_type: 'client_credentials'
      }
    });
  },

  /**
   * Performs a fetch operation with authentication header.
   *
   * @param {string|import('./RestService').RestParams} actionOrArgs - The action to be performed or REST parameters.
   * @param {import('./RestService').RestParams} [args] - The REST parameters.
   * @returns {dw.svc.Result} The result of the fetch operation.
   */
  authFetch: function (actionOrArgs, args) {
    var action = typeof actionOrArgs === 'string' ? actionOrArgs : 'default';
    var params = args || actionOrArgs;
    var credential = this._getAuthCredential();

    return this.fetch(action, Object.assign({
      auth: {
        type: credential.tokenType,
        credentials: credential.accessToken
      }
    }, params));
  },

  /**
   * Retrieves authorization credentials from the cache.
   *
   * @protected
   * @returns {AuthCredentials} The authorization credentials.
   */
  _getAuthCredential: function () {
    var CacheMgr = require('dw/system/CacheMgr');
    var cache = CacheMgr.getCache(this.CACHE_ID);
    var self = this;

    var credential = cache.get('credential', function () {
      var result = self.authorize();

      if (!result.ok) {
        throw result;
      }

      return {
        tokenType: result.object.token_type,
        accessToken: result.object.access_token
      };
    });

    return credential;
  }
});

/**
 * Represents authorization credentials.
 * @typedef {Object} AuthCredentials
 * @property {string} tokenType - The type of the access token.
 * @property {string} accessToken - The access token.
 */

module.exports = RestAuthService;
