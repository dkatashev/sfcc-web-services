'use strict';

/**
 * Raw headers utilities.
 */
module.exports = {
  /**
   * Parses raw headers into an object.
   *
   * @param {string} rawHeaders - The raw headers string.
   * @returns {Object.<string, string>} The parsed headers.
   */
  parse: function (rawHeaders) {
    var headerLines = rawHeaders.split(/\r?\n/); // Handle CRLF or LF
    var headers = {};

    headerLines.forEach(function (line) {
      var delimiterIndex = line.indexOf(':');
      if (delimiterIndex > -1) {
        var name = line.substring(0, delimiterIndex).trim().toLowerCase();
        var value = line.substring(delimiterIndex + 1).trim();
        headers[name] = value;
      }
    });

    return headers;
  },

  /**
   * Converts headers object to raw headers string.
   *
   * @param {Object.<string, string>} headers - The headers object.
   * @returns {string} The raw headers string.
   */
  format: function (headers) {
    return Object.keys(headers).map(function (name) {
      return name + ': ' + headers[name];
    }).join('\r\n');
  }
};
