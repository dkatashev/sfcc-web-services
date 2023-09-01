'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * Represents parameters for sending an email.
 * @typedef {Object} MailParams
 * @property {string} from - The sender's email address.
 * @property {string[]} to - An array of recipient email addresses.
 * @property {string[]} [cc] - An optional array of CC recipient email addresses.
 * @property {string[]} [bcc] - An optional array of BCC recipient email addresses.
 * @property {string} subject - The subject of the email.
 * @property {Object} content - The content of the email.
 * @property {string|dw.value.MimeEncodedText} content.body - The body of the email content.
 * @property {string} [content.mimeType] - The MIME type of the content.
 * @property {string} [content.encoding] - The encoding of the content.
 */

/**
 * Represents a service object for sending emails.
 */
var MailService = BaseService.extend({
  /**
   * Creates an email request based on the provided parameters.
   *
   * @param {dw.svc.Service & {client: dw.net.Mail}} svc - The email service instance with Mail client property.
   * @param {MailParams} params - The parameters for creating the email request.
   * @returns {MailParams} The input parameters.
   */
  createRequest: function (svc, params) {
    var Mail = require('dw/net/Mail');

    svc.client = new Mail();
    svc.client.setFrom(params.from);
    svc.client.setTo(params.to);

    if (params.cc) {
      svc.client.setCc(params.cc);
    }

    if (params.bcc) {
      svc.client.setBcc(params.bcc);
    }

    svc.client.setSubject(params.subject);

    var content = params.content;

    if (typeof content.body === 'string' && content.mimeType && content.encoding) {
      svc.client.setContent(content.body, content.mimeType, content.encoding);
    } else {
      svc.client.setContent(content.body);
    }

    return params;
  },

  /**
   * Sends the email using the provided email service client.
   *
   * @param {dw.svc.Service & {client: dw.net.Mail}} svc - The email service instance with Mail client property.
   * @returns {dw.net.Mail} The result of the email sending operation.
   * @throws {Error} Throws an error if there's an issue sending the email.
   */
  execute: function (svc) {
    var result = svc.client.send();

    if (result.error) {
      throw new Error(result.message);
    }

    return result;
  }
});

module.exports = MailService;
