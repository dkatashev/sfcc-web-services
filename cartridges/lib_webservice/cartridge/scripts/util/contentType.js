'use strict';

/**
 * Content type header utilities
 */
module.exports = {
  MIME_TYPE_RE: /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/,
  PARAMETER_RE: /; *([!#$%&'*+.^\w`|~-]+)=("(?:[\x0b\x20\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x0b\x20-\xff])*"|[!#$%&'*+.^\w`|~-]+) */g,

  /**
   * Parses a Content-Type header string into a ContentType object.
   *
   * @param {string} header - The Content-Type header string.
   * @returns {ContentType} The parsed content type information.
   */
  parse: function (header) {
    var result = {
      type: '',
      params: {}
    };
    var parts = header.split(';').map(function (part) {
      return part.trim();
    });
    var type = parts[0];
    var params = parts.slice(1);

    if (this.MIME_TYPE_RE.test(type)) {
      result.type = type;
    }

    this.PARAMETER_RE.lastIndex = 0;
    params.forEach(function (param) {
      var match = this.PARAMETER_RE.exec(';' + param);

      if (match) {
        var key = match[1];
        var value = match[2].replace(/^"|"$/g, '');

        result.params[key] = value;
      }
    }, this);

    return result;
  },

  /**
   * Creates a Content-Type header string from a ContentType object.
   *
   * @param {ContentType} contentType - The content type information.
   * @returns {string} The Content-Type header string.
   */
  format: function (contentType) {
    var parts = [contentType.type];

    Object.keys(contentType.params).forEach(function (param) {
      parts.push(param + '=' + contentType.params[param]);
    });

    return parts.join('; ');
  }
};

/**
 * Represents content type information.
 * @typedef {Object} ContentType
 * @property {string} type - The MIME type.
 * @property {Object.<string,string>} params - The parameters associated with the MIME type.
 */
