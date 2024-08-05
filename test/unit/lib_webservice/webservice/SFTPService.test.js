'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockFTPClient = mocks['dw/net/FTPClient'];
const MockSFTPClient = mocks['dw/net/SFTPClient'];
const MockServiceProfile = mocks['dw/svc/ServiceProfile'];
const MockServiceCredential = mocks['dw/svc/ServiceCredential'];
const SFTPService = mocks['*/cartridge/scripts/webservice/SFTPService'];

describe('scripts/webservice/SFTPService', () => {
  describe('initServiceClient()', () => {
    let credential;
    let profile;
    let svc;
    let TestService;

    beforeEach(() => {
      profile = new MockServiceProfile();
      credential = new MockServiceCredential('sftp.test.credentials');
      svc = {
        configuration: {
          profile,
          credential,
        },
      };
      TestService = SFTPService.extend({
        _getServiceCredential: sinon.stub().returns(credential),
      });
    });

    it('should initialize an FTP client correctly', () => {
      credential.URL = 'ftp://test.com';
      profile.timeoutMillis = 3000;
      TestService = TestService.extend({
        _getClient: sinon.stub().returns({
          connect: sinon.stub(),
          setTimeout: sinon.stub(),
        }),
      });

      const client = TestService.initServiceClient(svc);

      expect(client.connect.calledWith('test.com', 'user', 'password')).to.be.true;
      expect(client.setTimeout.calledWith(profile.timeoutMillis)).to.be.true;
    });

    it('should initialize an SFTP client correctly', () => {
      credential.URL = 'sftp://test.com';
      profile.timeoutMillis = null;

      TestService = TestService.extend({
        _getClient: sinon.stub().returns({
          connect: sinon.stub(),
          setTimeout: sinon.stub(),
        }),
      });

      const client = TestService.initServiceClient(svc);

      expect(client.connect.calledWith('test.com', 'user', 'password')).to.be.true;
      expect(client.setTimeout.calledOnce).to.be.false;
    });

    it('should throw an error if the URL is invalid', () => {
      credential.URL = 'invalid://test.com';
      expect(() => TestService.initServiceClient(svc)).to.throw('(S)FTP URL is invalid!');
    });
  });

  describe('execute()', () => {
    let client;
    let svc;
    let TestService;

    beforeEach(() => {
      client = {
        get: sinon.stub().returns('fileContent'),
        put: sinon.stub().returns('putResult'),
      };
      svc = {
        client: client,
      };
      TestService = SFTPService.extend();
    });

    it('should execute a single operation with arguments', () => {
      const params = {
        operation: 'get',
        args: ['remotePath', 'localPath']
      };

      const result = TestService.execute(svc, params);
      expect(client.get.calledWith('remotePath', 'localPath')).to.be.true;
      expect(result).to.equal('fileContent');
    });

    it('should execute multiple operations using callback', () => {
      const mockOnExecute = sinon.stub().returns('executeResult');
      const params = {
        onExecute: mockOnExecute
      };

      const result = TestService.execute(svc, params);
      expect(mockOnExecute.calledOnce).to.be.true;
      expect(result).to.equal('executeResult');
    });

    it('should throw an error if no valid operation or callback is provided', () => {
      const params = {};
      const errorMessage = 'Operation with arguments should be provided. Or execute callback.';
      expect(() => TestService.execute(svc, params)).to.throw(errorMessage);
    });
  });

  describe('_getClient()', () => {
    let TestService;

    beforeEach(() => {
      TestService = SFTPService.extend();
    });

    it('should return an FTP client for ftp protocol', () => {
      const client = TestService._getClient('ftp');
      expect(client).to.be.instanceof(MockFTPClient);
    });

    it('should return an SFTP client for sftp protocol', () => {
      const client = TestService._getClient('sftp');
      expect(client).to.be.instanceof(MockSFTPClient);
    });

    it('should throw an error for an invalid protocol', () => {
      expect(() => TestService._getClient('invalid')).to.throw('(S)FTP URL is invalid!');
    });
  });
});
