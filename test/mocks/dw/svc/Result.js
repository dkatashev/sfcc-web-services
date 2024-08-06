'use strict';

class Result {
  constructor(status = Result.OK, object = null) {
    this.status = status;
    this.object = object;
    this.ok = status === Result.OK;

    if (status === Result.ERROR) {
      this.error = 0;
      this.errorMessage = 'ERROR';
    }

    this.mockResult = false;
    this.msg = null;
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

module.exports = Result;
