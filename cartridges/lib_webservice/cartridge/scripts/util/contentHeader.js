'use strict';

/**
 * Content header utilities
 */
module.exports = {
  MIME_TYPE_RE: /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/,
  DISPOSITION_TYPE_RE: /^[!#$%&'*+.^\w|~-]+$/,
  PARAMETER_RE: / *([!#$%&'*+.^\w`|~-]+)=("(?:[\x0b\x20\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x0b\x20-\xff])*"|[!#$%&'*+.^\w`|~-]+) */,
  QUOTED_VALUE_RE: /^[!#$%&'*+.^\w`|~-]+$/,

  /**
   * Parses a header string into an object with type and parameters.
   *
   * @param {string} header - The content header string.
   * @param {'type'|'disposition'} [headerType='type'] - The content header type.
   * @returns {ContentHeader} The parsed content header information.
   */
  parse: function (header, headerType) {
    var result = { type: '', params: {} };
    var parts = header.split(';');
    var type = parts.shift().trim();
    var typeRegex = headerType === 'disposition' ? this.DISPOSITION_TYPE_RE : this.MIME_TYPE_RE;
    var self = this;

    if (typeRegex.test(type)) {
      result.type = type;
    }

    parts.forEach(function (param) {
      var match = self.PARAMETER_RE.exec(param);

      if (match) {
        var key = match[1];
        var value = match[2].replace(/^"|"$/g, '').replace(/\\"/g, '"');

        result.params[key] = value;
      }
    });

    return result;
  },

  /**
   * Creates a content header string from a ContentHeader object.
   *
   * @param {ContentHeader} contentHeader - The content header information.
   * @returns {string} The content header string.
   */
  format: function (contentHeader) {
    var parts = [];

    if (contentHeader.type) {
      parts.push(contentHeader.type);
    }

    var params = contentHeader.params;
    var quotedRegex = this.QUOTED_VALUE_RE;

    if (params) {
      Object.keys(contentHeader.params).forEach(function (param) {
        var value = contentHeader.params[param];

        if (!quotedRegex.test(value)) {
          value = '"' + value.replace(/"/g, '\\"') + '"';
        }

        parts.push(param + '=' + value);
      });
    }

    return parts.join('; ');
  },
};

/**
 * Represents content type information.
 * @typedef {Object} ContentHeader
 * @property {string} type - The MIME/Disposition type.
 * @property {Object.<string,string>} params - The parameters associated with the MIME/Disposition type.
 */
