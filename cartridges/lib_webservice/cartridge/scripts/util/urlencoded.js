'use strict';

var Encoding = require('dw/crypto/Encoding');

/**
 * Urlencoded body utilities.
 */
module.exports = {
  /**
   * Converts a URL-encoded string to an object.
   *
   * @param {string} urlEncoded - The URL-encoded string to be converted.
   * @returns {Object.<string, string>} The resulting object.
   */
  parse: function (urlEncoded) {
    return urlEncoded.split('&').reduce(function (state, next) {
      if (next) {
        var pairs = next.split('=');
        var key = Encoding.fromURI(pairs[0]);
        var value = Encoding.fromURI(pairs[1] || '');

        state[key] = value;
      }

      return state;
    }, {});
  },

  /**
   * Converts an object to a URL-encoded string.
   *
   * @param {Object.<string, string>} data - The data object to be converted.
   * @returns {string} The URL-encoded string.
   */
  format: function (data) {
    return Object.keys(data)
      .map(function (key) {
        return Encoding.toURI(key) + '=' + Encoding.toURI(data[key]);
      })
      .join('&');
  },
};
