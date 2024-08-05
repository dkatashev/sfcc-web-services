'use strict';

class Result {
  constructor() {
    this.error = -1;
    this.errorMessage = null;
    this.mockResult = false;
    this.msg = null;
    this.object = null;
    this.ok = true;
    this.status = Result.OK;
    this.unavailableReason = null;
  }

  getError() {
    return this.error;
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getMsg() {
    return this.msg;
  }

  getObject() {
    return this.object;
  }

  getStatus() {
    return this.status;
  }

  getUnavailableReason() {
    return this.unavailableReason;
  }

  isMockResult() {
    return this.mockResult;
  }

  isOk() {
    return this.ok;
  }

  // eslint-disable-next-line class-methods-use-this
  toString() {
    return '';
  }
}

Result.ERROR = 'ERROR';
Result.OK = 'OK';
Result.SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
Result.UNAVAILABLE_CIRCUIT_BROKEN = 'UNAVAILABLE_CIRCUIT_BROKEN';
Result.UNAVAILABLE_CONFIG_PROBLEM = 'UNAVAILABLE_CONFIG_PROBLEM';
Result.UNAVAILABLE_DISABLED = 'UNAVAILABLE_DISABLED';
Result.UNAVAILABLE_RATE_LIMITED = 'UNAVAILABLE_RATE_LIMITED';
Result.UNAVAILABLE_TIMEOUT = 'UNAVAILABLE_TIMEOUT';

Result.unitTest = {
  OK: (function () {
    const result = new Result();
    result.ok = true;
    result.status = Result.OK;
    return result;
  }()),
  ERROR: (function () {
    const result = new Result();
    result.ok = false;
    result.status = Result.ERROR;
    result.errorMessage = 'ERROR';
    return result;
  }()),
};

module.exports = Result;
