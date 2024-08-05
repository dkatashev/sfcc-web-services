'use strict';

class WSUtil {
  static addSOAPHeader(port, xml, mustUnderstand, actor) {
    // Mock implementation
  }

  static clearSOAPHeaders(port) {
    // Mock implementation
  }

  static createHolder(element) {
    // Mock implementation
    return { value: element };
  }

  static getConnectionTimeout(port) {
    // Mock implementation
    return 10000; // Example timeout value
  }

  static getHTTPRequestHeader(port, key) {
    // Mock implementation
    return null;
  }

  static getProperty(key, port) {
    // Mock implementation
    return null;
  }

  static getRequestTimeout(port) {
    // Mock implementation
    return 10000; // Example timeout value
  }

  static getResponseProperty(key, port) {
    // Mock implementation
    return null;
  }

  static isAllowChunking(port) {
    // Mock implementation
    return true;
  }

  static setAllowChunking(port, allow) {
    // Mock implementation
  }

  static setConnectionTimeout(timeoutInMilliseconds, port) {
    // Mock implementation
  }

  static setHTTPRequestHeader(port, key, value) {
    // Mock implementation
  }

  static setProperty(key, value, port) {
    // Mock implementation
  }

  static setRequestTimeout(timeoutInMilliseconds, port) {
    // Mock implementation
  }

  static setUserNamePassword(userName, password, port) {
    // Mock implementation
  }

  static setWSSecurityConfig(port, requestConfigMap, responseConfigMap) {
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

module.exports = WSUtil;
