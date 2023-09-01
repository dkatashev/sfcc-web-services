'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

/**
 * SFTP Service
 */
var SFTPService = BaseService.extend({
  /**
   * Creates a request for the SFTP service.
   *
   * @param {dw.svc.FTPService} svc - The FTP service instance.
   * @param {SFTPParams} params - The parameters for creating the request.
   * @returns {SFTPParams} The input parameters.
   */
  createRequest: function (svc, params) {
    this._getServiceCredential(svc, params);

    return params;
  },

  /**
   * Executes the SFTP service operations.
   *
   * @param {dw.svc.FTPService} svc - The FTP service instance.
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
   * Retrieves the service credential for the SFTP service.
   *
   * @protected
   * @param {dw.svc.FTPService} svc - The FTP service instance.
   * @param {SFTPParams} params - The SFTP parameters.
   * @returns {dw.svc.ServiceCredential} The service credential.
   */
  // eslint-disable-next-line no-unused-vars
  _getServiceCredential: function (svc, params) {
    return svc.configuration.credential;
  }
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
