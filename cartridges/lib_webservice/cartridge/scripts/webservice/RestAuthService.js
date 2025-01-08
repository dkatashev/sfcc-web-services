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
   * ID of the custom cache used to store auth credentials.
   * @type {string}
   */
  CACHE_ID: 'authCredentials',

  /**
   * KEY of the custom cache used to store auth credentials.
   * @type {string}
   */
  CACHE_KEY: '',

  /**
   * Implementation of getAuthentication callback
   *
   * @returns {import('./RestService').Authentication}
   */
  getAuthentication: function () {
    var CacheMgr = require('dw/system/CacheMgr');

    // Get the cache and stored data
    var cache = CacheMgr.getCache(this.CACHE_ID);
    var stored = cache.get(this.CACHE_KEY) || {};

    // Check if the token is not expired
    if (stored.expiration && stored.expiration >= Date.now()) {
      return stored.auth;
    }

    // Token is expired or not present, invalidate the cache
    cache.invalidate(this.CACHE_KEY);

    // Perform authorization request
    var result = this.sendAuthRequest();

    // Check if the authorization was successful
    if (!result.ok) {
      var error = new Error('Authorization failed');
      error.result = result;
      throw error;
    }

    // Parse the authorization result
    var data = this.parseAuthResult(result);

    // Update the data with new token and expiration
    data.expiration += Date.now();

    // Save the new data to cache
    cache.put(this.CACHE_KEY, data);

    return data.auth;
  },

  /**
   * Performs authorization using the 'auth' service action.
   *
   * @returns {dw.svc.Result} The result of the authorization request.
   */
  sendAuthRequest: function () {
    throw new Error('sendAuthRequest method must be implemented by subclass');
  },

  /**
   * Parses the authorization result.
   *
   * @param {dw.svc.Result} result The result of the authorization request.
   * @returns {AuthorizationCache} The parsed authorization result.
   */
  // eslint-disable-next-line no-unused-vars
  parseAuthResult: function (result) {
    throw new Error('parseAuthResult method must be implemented by subclass');
  },
});

/**
 * @typedef {import('./RestService').Authentication} Authentication
 */

/**
 * @typedef {Object} AuthorizationCache
 * @property {number} expiration - The expiration time of the token.
 * @property {Authentication} auth - The authorization data.
 */

module.exports = RestAuthService;
