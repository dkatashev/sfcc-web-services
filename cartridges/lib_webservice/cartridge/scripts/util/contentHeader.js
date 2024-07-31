'use strict';

/**
 * Content header utilities
 */
module.exports = {
  MIME_TYPE_RE: /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/,
  DISPOSITION_TYPE_RE: /^[!#$%&'*+.^\w|~-]+$/,
  PARAMETER_RE: / *([!#$%&'*+.^\w`|~-]+)=("(?:[\x0b\x20\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x0b\x20-\xff])*"|[!#$%&'*+.^\w`|~-]+) */,

  /**
   * Parses a header string into an object with type and parameters.
   *
   * @param {string} header - The content header string.
   * @param {'type'|'disposition'} [headerType='type'] - The content header type.
   * @returns {ContentHeader} The parsed content header information.
   */
  parse: function (header, headerType) {
    var result = {
      type: '',
      params: {}
    };
    var parts = header.split(';').map(function (part) {
      return part.trim();
    });
    var type = parts.shift();
    var typeRegex = headerType === 'disposition' ? this.DISPOSITION_TYPE_RE : this.MIME_TYPE_RE;

    if (typeRegex.test(type)) {
      result.type = type;
    }

    parts.forEach(function (param) {
      var match = this.PARAMETER_RE.exec(param);

      if (match) {
        var key = match[1];
        var value = match[2].replace(/^"|"$/g, '');

        result.params[key] = value;
      }
    }, this);

    return result;
  },

  /**
   * Creates a content header string from a ContentHeader object.
   *
   * @param {ContentHeader} contentHeader - The content header information.
   * @returns {string} The content header string.
   */
  format: function (contentHeader) {
    var parts = [contentHeader.type];

    Object.keys(contentHeader.params).forEach(function (param) {
      parts.push(param + '=' + contentHeader.params[param]);
    });

    return parts.join('; ');
  },
};

/**
 * Represents content type information.
 * @typedef {Object} ContentHeader
 * @property {string} type - The MIME/Disposition type.
 * @property {Object.<string,string>} params - The parameters associated with the MIME/Disposition type.
 */
