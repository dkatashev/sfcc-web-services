'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockFTPClient = mocks['dw/net/FTPClient'];
const MockSFTPClient = mocks['dw/net/SFTPClient'];
const MockFTPService = mocks['dw/svc/FTPService'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

const BaseService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
  'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
});
const SFTPService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/SFTPService', {
  'dw/net/FTPClient': MockFTPClient,
  'dw/net/SFTPClient': MockSFTPClient,
  '*/cartridge/scripts/webservice/BaseService': BaseService,
});

describe('scripts/webservice/SFTPService', () => {
  let TestService;

  beforeEach(() => {
    TestService = SFTPService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'sftp.service',
        ftp: 'ftp.service',
        sftp: 'sftp.service',
      },
    });
  });

  describe('#initServiceClient()', () => {
    it('should initialize an FTP client correctly', () => {
      const params = {};
      const svc = TestService._createService('ftp', params);
      const client = TestService.initServiceClient(svc);

      expect(client).to.be.instanceOf(MockFTPClient);
      sinon.assert.calledOnce(client.connect);
    });

    it('should initialize an SFTP client correctly', () => {
      const params = {};
      const svc = TestService._createService('sftp', params);
      const client = TestService.initServiceClient(svc);

      expect(client).to.be.instanceOf(MockSFTPClient);
      sinon.assert.calledOnce(client.connect);
    });

    it('should throw an error if the URL is invalid', () => {
      const params = {};
      const svc = TestService._createService(undefined, params);
      const errorMessage = '(S)FTP URL is invalid!';

      svc.configuration.credential.URL = 'invalid://test.com';

      expect(() => TestService.initServiceClient(svc)).to.throw(errorMessage);
    });
  });

  describe('#execute()', () => {
    it('should execute a single operation with arguments', () => {
      const params = {
        operation: 'get',
        args: ['remotePath', 'localPath']
      };
      const svc = TestService._createService('sftp', params);

      TestService.execute(svc, params);

      expect(svc).to.be.instanceOf(MockFTPService);
      sinon.assert.calledWith(svc.client.get, 'remotePath', 'localPath');
    });

    it('should execute multiple operations using callback', () => {
      const params = {
        onExecute: (svc) => {
          var client = svc.client;

          if (client.cd('path/to')) {
            return client.del('file.xml');
          }

          return false;
        }
      };
      const svc = TestService._createService('sftp', params);

      svc.client.cd.returns(true);
      svc.client.del.returns(false);

      const result = TestService.execute(svc, params);

      expect(svc).to.be.instanceOf(MockFTPService);
      expect(result).to.be.false;
      sinon.assert.calledWith(svc.client.cd, 'path/to');
      sinon.assert.calledWith(svc.client.del, 'file.xml');
    });

    it('should throw an error if no valid operation or callback is provided', () => {
      const params = {};
      const svc = TestService._createService('sftp', params);
      const errorMessage = 'Operation with arguments should be provided. Or execute callback.';

      expect(() => TestService.execute(svc, params)).to.throw(errorMessage);
    });
  });

  describe('#_getClient()', () => {
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
