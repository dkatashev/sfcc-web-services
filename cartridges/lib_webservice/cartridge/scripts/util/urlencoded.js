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
    var result = {};
    var pairs = urlEncoded.split('&');

    pairs.forEach(function (pair) {
      if (!pair) return;

      var keyValue = pair.split('=');
      var key = Encoding.fromURI(keyValue[0]);
      var value = Encoding.fromURI(keyValue[1] || '');

      result[key] = value;
    });

    return result;
  },

  /**
   * Converts an object to a URL-encoded string.
   *
   * @param {Object.<string, string>} data - The data object to be converted.
   * @returns {string} The URL-encoded string.
   */
  format: function (data) {
    var parts = [];

    Object.keys(data).forEach(function (key) {
      parts.push(Encoding.toURI(key) + '=' + Encoding.toURI(data[key]));
    });

    return parts.join('&');
  },
};
