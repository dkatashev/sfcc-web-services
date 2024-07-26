'use strict';

var headers = require('*/cartridge/scripts/util/headers');

/**
 * Multipart body utilities.
 */
module.exports = {
  /**
   * Parses a multipart body into an array of parts.
   *
   * @param {string} boundary - The boundary string.
   * @param {string} body - The raw multipart body.
   * @returns {Array.<MultipartChunk>} The parsed parts.
   */
  parse: function (boundary, body) {
    var delimiter = '--' + boundary;
    var parts = body.split(delimiter).slice(1, -1); // Ignore preamble and epilogue
    var crlf = '\r\n';

    return parts.map(function (part) {
      var partDetails = part.split(/\r?\n\r?\n/); // Handle CRLF or LF
      var rawHeaders = partDetails[0].trim();
      var rawBody = partDetails.slice(1).join(crlf + crlf); // Rejoin body parts with CRLF

      return {
        headers: headers.parse(rawHeaders),
        body: rawBody
      };
    }, this);
  },

  /**
   * Converts an array of parts to a multipart body string.
   *
   * @param {string} boundary - The boundary string.
   * @param {Array.<MultipartChunk>} parts - The parts to convert.
   * @returns {string} The multipart body string.
   */
  format: function (boundary, parts) {
    var delimiter = '--' + boundary;
    var crlf = '\r\n';
    var body = parts.map(function (part) {
      return headers.format(part.headers) + crlf + crlf + part.body;
    }).join(crlf + delimiter + crlf);

    return delimiter + crlf + body + crlf + delimiter + '--';
  }
};

/**
 * Represents multipart chunk.
 * @typedef {Object} MultipartChunk
 * @property {Object.<string,string>} headers - The HTTP headers.
 * @property {string} body - The HTTP body.
 */
