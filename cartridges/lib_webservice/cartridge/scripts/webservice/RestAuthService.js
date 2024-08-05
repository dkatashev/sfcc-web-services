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
    auth: '',
  },

  /**
   * ID of the custom cache used to store access tokens.
   * @type {string}
   */
  CACHE_ID: '',

  /**
   * KEY of the custom cache used to store access tokens.
   * @type {string}
   */
  CACHE_KEY: '',

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
        grant_type: 'client_credentials',
      },
    });
  },

  /**
   * Implementation of getAuthentication callback
   *
   * @param {import('./RestService').RestParams} args
   * @param {dw.svc.HTTPService} svc
   * @param {dw.svc.ServiceCredential} credential
   * @returns {import('./RestService').Authentication}
   */
  // eslint-disable-next-line no-unused-vars
  getAuthentication: function (args, svc, credential) {
    var CacheMgr = require('dw/system/CacheMgr');
    var cache = CacheMgr.getCache(this.CACHE_ID);
    var self = this;

    var authentication = cache.get(this.CACHE_KEY, function () {
      var result = self.authorize();

      if (!result.ok) {
        throw result.errorMessage;
      }

      return {
        type: result.object.token_type,
        credentials: result.object.access_token,
      };
    });

    return authentication;
  },
});

module.exports = RestAuthService;
