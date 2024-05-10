'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * SFTP Service
 */
var SFTPService = BaseService.extend({
  /**
   * Creates a protocol-specific client object.
   *
   * @param {dw.svc.FTPService} svc - The (S)FTP service instance.
   * @returns {SFTPParams} The input parameters.
   */
  initServiceClient: function (svc) {
    var profile = svc.configuration.profile;
    var credential = this._getServiceCredential(svc);
    var match = credential.URL.match(/^(s?ftp):\/\/([^/:]+)/);

    if (!match) {
      throw new Error('(S)FTP URL is invalid!');
    }

    var protocolType = match[1];
    var host = match[2];
    var client = this._getClient(protocolType);

    client.connect(host, credential.user, credential.password);

    if (profile.timeoutMillis) {
      client.setTimeout(profile.timeoutMillis);
    }

    return client;
  },

  /**
   * Executes the (S)FTP service operations.
   *
   * @param {dw.svc.FTPService} svc - The (S)FTP service instance.
   * @param {SFTPParams} params - The parameters for executing the operations.
   * @returns {*} The result of the executed operation.
   * @throws {Error} If no valid operation with arguments or execute callback is provided.
   */
  execute: function (svc, params) {
    /**
     * Useful for a single operation, such as download file
     */
    if (params.operation && params.args) {
      return svc.client[params.operation].apply(svc.client, params.args);
    }

    /**
     * Useful to make multiple operations
     */
    if (typeof params.onExecute === 'function') {
      return params.onExecute(svc);
    }

    throw new Error('Operation with arguments should be provided. Or execute callback.');
  },

  /**
   * Retrieves the service credential for the (S)FTP service.
   *
   * @protected
   * @param {dw.svc.FTPService} svc - The (S)FTP service instance.
   * @returns {dw.svc.ServiceCredential} The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _getServiceCredential: function (svc) {
    return svc.configuration.credential;
  },

  /**
   * Return an FTP or SFTP client
   *
   * @protected
   * @param {string} protocolType
   * @returns {dw.svc.FTPClient|dw.svc.SFTPClient}
   */
  _getClient: function (protocolType) {
    var FTPClient = require('dw/net/FTPClient');
    var SFTPClient = require('dw/net/SFTPClient');

    switch (protocolType) {
      case 'ftp':
        return new FTPClient();
      case 'sftp':
        return new SFTPClient();
      default:
        throw new Error('(S)FTP URL is invalid!');
    }
  },
});

/**
 * Callback function for executing SFTP operations.
 * @callback onExecute
 * @param {dw.svc.FTPService} svc - The FTP service instance.
 * @returns {*} The result of the executed operations.
 */

/**
 * Represents parameters for the SFTP service.
 * @typedef {Object} SFTPParams
 * @property {'cd'|'del'|'get'|'getBinary'|'getFileInfo'|'list'|'mkdir'|'put'|'putBinary'|'removeDirectory'|'rename'} operation - The SFTP operation to be executed.
 * @property {*[]} args - The arguments for the operation.
 * @property {onExecute} [onExecute] - Callback for executing multiple operations.
 */

module.exports = SFTPService;
