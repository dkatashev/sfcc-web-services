'use strict';

class Port {
  constructor() {
    this.encoding = null;
    this.endpointAddress = null;
    this.password = null;
    this.sessionMaintain = false;
    this.username = null;
  }
}

Port.ENCODING = 'encoding';
Port.ENDPOINT_ADDRESS_PROPERTY = 'endpointAddress';
Port.PASSWORD_PROPERTY = 'password';
Port.SESSION_MAINTAIN_PROPERTY = 'sessionMaintain';
Port.USERNAME_PROPERTY = 'username';

module.exports = Port;
