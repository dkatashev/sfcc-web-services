'use strict';

const sinon = require('sinon');

class Port {
  constructor(operations = []) {
    operations.forEach((operation) => {
      this[operation] = sinon.stub();
    });
  }
}

Port.ENCODING = 'encoding';
Port.ENDPOINT_ADDRESS_PROPERTY = 'endpointAddress';
Port.PASSWORD_PROPERTY = 'password';
Port.SESSION_MAINTAIN_PROPERTY = 'sessionMaintain';
Port.USERNAME_PROPERTY = 'username';

module.exports = Port;
