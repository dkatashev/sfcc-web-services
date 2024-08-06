'use strict';

const sinon = require('sinon');

class WSUtil {
  static addSOAPHeader() {
    // Mock implementation
  }

  static clearSOAPHeaders() {
    // Mock implementation
  }

  static createHolder() {
    // Mock implementation
  }

  static getConnectionTimeout() {
    // Mock implementation
  }

  static getHTTPRequestHeader() {
    // Mock implementation
  }

  static getProperty() {
    // Mock implementation
  }

  static getRequestTimeout() {
    // Mock implementation
  }

  static getResponseProperty() {
    // Mock implementation
  }

  static isAllowChunking() {
    // Mock implementation
  }

  static setAllowChunking() {
    // Mock implementation
  }

  static setConnectionTimeout() {
    // Mock implementation
  }

  static setHTTPRequestHeader() {
    // Mock implementation
  }

  static setProperty() {
    // Mock implementation
  }

  static setRequestTimeout() {
    // Mock implementation
  }

  static setUserNamePassword() {
    // Mock implementation
  }

  static setWSSecurityConfig() {
    // Mock implementation
  }
}

WSUtil.KEY_ID_TYPE_DIRECT_REFERENCE = 'DirectReference';
WSUtil.KEY_ID_TYPE_ENC_KEY_SHA1 = 'EncryptedKeySHA1';
WSUtil.KEY_ID_TYPE_ISSUE_SERIAL = 'IssuerSerial';
WSUtil.KEY_ID_TYPE_SKI_IDENTIFIER = 'SKIKeyIdentifier';
WSUtil.KEY_ID_TYPE_THUMBPRINT = 'Thumbprint';
WSUtil.KEY_ID_TYPE_X509_KEY_IDENTIFIER = 'X509KeyIdentifier';
WSUtil.WS_ACTION = 'action';
WSUtil.WS_ENC_KEY_ID = 'encryptionKeyIdentifier';
WSUtil.WS_ENC_PROP_KEYSTORE_ALIAS = '__EncryptionPropKeystoreAlias';
WSUtil.WS_ENC_PROP_KEYSTORE_PW = '__EncryptionPropKeystorePassword';
WSUtil.WS_ENC_PROP_KEYSTORE_TYPE = '__EncryptionPropKeystoreType';
WSUtil.WS_ENCRYPT = 'Encrypt';
WSUtil.WS_ENCRYPTION_PARTS = 'encryptionParts';
WSUtil.WS_ENCRYPTION_USER = 'encryptionUser';
WSUtil.WS_NO_SECURITY = 'NoSecurity';
WSUtil.WS_PASSWORD_TYPE = 'passwordType';
WSUtil.WS_PW_DIGEST = 'PasswordDigest';
WSUtil.WS_PW_TEXT = 'PasswordText';
WSUtil.WS_SECRETS_MAP = '__SecretsMap';
WSUtil.WS_SIG_DIGEST_ALGO = 'signatureDigestAlgorithm';
WSUtil.WS_SIG_KEY_ID = 'signatureKeyIdentifier';
WSUtil.WS_SIG_PROP_KEYSTORE_ALIAS = '__SignaturePropKeystoreAlias';
WSUtil.WS_SIG_PROP_KEYSTORE_PW = '__SignaturePropKeystorePassword';
WSUtil.WS_SIG_PROP_KEYSTORE_TYPE = '__SignaturePropKeystoreType';
WSUtil.WS_SIGNATURE = 'Signature';
WSUtil.WS_SIGNATURE_PARTS = 'signatureParts';
WSUtil.WS_SIGNATURE_USER = 'signatureUser';
WSUtil.WS_TIMESTAMP = 'Timestamp';
WSUtil.WS_USER = 'user';
WSUtil.WS_USERNAME_TOKEN = 'UsernameToken';

// Stubbing methods with sinon
sinon.stub(WSUtil, 'addSOAPHeader');
sinon.stub(WSUtil, 'clearSOAPHeaders');
sinon.stub(WSUtil, 'createHolder');
sinon.stub(WSUtil, 'getConnectionTimeout');
sinon.stub(WSUtil, 'getHTTPRequestHeader');
sinon.stub(WSUtil, 'getProperty');
sinon.stub(WSUtil, 'getRequestTimeout');
sinon.stub(WSUtil, 'getResponseProperty');
sinon.stub(WSUtil, 'isAllowChunking');
sinon.stub(WSUtil, 'setAllowChunking');
sinon.stub(WSUtil, 'setConnectionTimeout');
sinon.stub(WSUtil, 'setHTTPRequestHeader');
sinon.stub(WSUtil, 'setProperty');
sinon.stub(WSUtil, 'setRequestTimeout');
sinon.stub(WSUtil, 'setUserNamePassword');
sinon.stub(WSUtil, 'setWSSecurityConfig');

module.exports = WSUtil;
