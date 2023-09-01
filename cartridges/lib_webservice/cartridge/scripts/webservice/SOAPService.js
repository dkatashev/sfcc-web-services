'use strict';

/** @type {import('./BaseService')} */
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

var SOAPService = BaseService.extend({
  /**
   * @param {dw.svc.SOAPService} svc
   * @param {*} params
   */
  createRequest: function (svc, params) {

  }
});

module.exports = SOAPService;
