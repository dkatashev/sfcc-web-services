'use strict';

var Bytes = require('dw/util/Bytes');
/** @type {import('../util/ByteStream')} */
var ByteStream = require('*/cartridge/scripts/util/ByteStream');
/** @type {import('../util/headers')} */
var headers = require('*/cartridge/scripts/util/headers');

/**
 * Multipart body utilities.
 */
module.exports = {
  /**
   * Parses a multipart body into an array of parts.
   *
   * @param {string} boundary - The boundary string.
   * @param {dw.util.Bytes} body - The raw multipart body.
   * @returns {Array.<MultipartChunk>} The parsed parts.
   */
  parse: function (boundary, body) {
    var crlf = '\r\n';
    var crlfBytes = new Bytes(crlf);
    var emptyLineBytes = new Bytes(crlf + crlf);
    var delimiterBytes = new Bytes(crlf + '--' + boundary);
    var byteStream = new ByteStream(body);
    var HN = ByteStream.charCode.HN;
    var parts = [];

    // Ignore preamble
    if (!byteStream.readUntil(new Bytes('--' + boundary))) {
      throw new TypeError('Invalid format: Missing multipart delimiter.');
    }

    // Read stream
    while (!byteStream.eos()) {
      // Next chars are `--` mean we reach end delimiter
      if (byteStream.peek() === HN && byteStream.peek(1) === HN) {
        // Skip to the end of stream
        byteStream.move(byteStream.length - byteStream.position);
        break;
      }

      // Ignore spaces and CRLF after delimiter
      byteStream.readUntil(crlfBytes);

      // Read headers
      var rawHeaders = byteStream.readUntil(emptyLineBytes);

      // Read body
      var rawBody = byteStream.readUntil(delimiterBytes);

      parts.push({
        headers: headers.parse(rawHeaders.toString()),
        body: rawBody
      });
    }

    return parts;
  },

  /**
   * Converts an array of parts to a multipart body string.
   *
   * @param {string} boundary - The boundary string.
   * @param {Array.<MultipartChunk>} parts - The parts to convert.
   * @returns {string} The multipart body string.
   */
  format: function (boundary, parts) {
    var crlf = '\r\n';
    var delimiter = crlf + '--' + boundary;
    var body = parts.map(function (part) {
      return headers.format(part.headers) + crlf + crlf + part.body;
    }).join(delimiter + crlf);

    return delimiter + crlf + body + crlf + delimiter + '--';
  },
};

/**
 * Represents multipart chunk.
 * @typedef {Object} MultipartChunk
 * @property {Object.<string,string>} headers - The HTTP headers.
 * @property {dw.util.Bytes} body - The HTTP body.
 */
