'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockService = mocks['dw/svc/Service'];
const MockEncoding = mocks['dw/crypto/Encoding'];
const MockWebDAVClient = mocks['dw/net/WebDAVClient'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

const urlencoded = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/urlencoded', {
  'dw/crypto/Encoding': MockEncoding,
});
const BaseService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
  'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
});
const WebDavService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/WebDavService', {
  'dw/net/WebDAVClient': MockWebDAVClient,
  '*/cartridge/scripts/util/urlencoded': urlencoded,
  '*/cartridge/scripts/webservice/BaseService': BaseService,
});

describe('scripts/webservice/WebDavService', () => {
  let TestService;

  beforeEach(() => {
    TestService = WebDavService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'webdav.service',
      },
    });
  });

  describe('#createRequest()', () => {
    it('should create a WebDAV request and set headers, path patterns, and client', () => {
      const params = {
        pathPatterns: { testParam: 'value' },
        queryParams: { q: 'search' },
        headers: { 'Content-Type': 'application/xml' },
      };
      const svc = TestService._createService('default', params);

      svc.configuration.credential.URL = 'https://test.com/:testParam';

      const request = TestService.createRequest(svc, params);

      expect(svc).to.be.instanceOf(MockService);
      expect(svc.client).to.be.instanceOf(MockWebDAVClient);
      expect(svc.URL).to.equal('https://test.com/value?q=search');
      expect(svc.client.allRequestHeaders.get('Content-Type')).to.equal('application/xml');
      expect(request).to.deep.equal({
        pathPatterns: { testParam: 'value' },
        queryParams: { q: 'search' },
        headers: { 'Content-Type': 'application/xml' },
      });
    });

    it('should call onCreateRequest callback if provided', () => {
      const params = {
        queryParams: { q: 'search' },
        headers: { 'Content-Type': 'application/xml' },
        onCreateRequest: sinon.stub(),
      };
      const svc = TestService._createService('default', params);

      svc.configuration.credential.URL = 'https://test.com/?existing=value';
      svc.configuration.credential.user = null;
      svc.configuration.credential.password = null;

      const request = TestService.createRequest(svc, params);

      expect(svc.URL).to.equal('https://test.com/?existing=value&q=search');
      expect(params.onCreateRequest.calledOnceWith(request, svc, svc.configuration.credential)).to.be.true;
    });

    it('should handle empty pathPatterns and queryParams gracefully', () => {
      const params = {
        headers: { 'Content-Type': 'application/xml' },
      };
      const svc = TestService._createService('default', params);

      svc.configuration.credential.URL = 'https://test.com/';

      const request = TestService.createRequest(svc, params);

      expect(svc.URL).to.equal('https://test.com/');
      expect(request).to.deep.equal({
        headers: { 'Content-Type': 'application/xml' },
        pathPatterns: {},
        queryParams: {},
      });
    });
  });

  describe('#execute()', () => {
    it('should execute a single WebDAV operation with arguments', () => {
      const params = {
        operation: 'get',
        args: ['remotePath', 'localPath']
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);
      svc.client.get.returns('response');

      const result = TestService.execute(svc, params);

      expect(result).to.equal('response');
      expect(svc.client.get.calledWith('remotePath', 'localPath')).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should execute multiple WebDAV operations using callback', () => {
      const params = {
        onExecute: (svc) => {
          const client = svc.client;

          client.cd = sinon.stub().returns(true);
          client.del = sinon.stub().returns(true);
          client.close = sinon.stub();

          return client.cd('path/to') && client.del('file.xml');
        }
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      const result = TestService.execute(svc, params);

      expect(result).to.be.true;
      expect(svc.client.cd.calledWith('path/to')).to.be.true;
      expect(svc.client.del.calledWith('file.xml')).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should throw an error if no valid operation or callback is provided', () => {
      const params = {};
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      expect(() => TestService.execute(svc, params)).to.throw('No valid operation or callback provided.');
    });
  });

  describe('#parseResponse()', () => {
    it('should parse the WebDAV service response and close client', () => {
      const response = 'response';
      const svc = TestService._createService('default', {});

      TestService.createRequest(svc, {});
      svc.client.succeeded.returns(true);

      const parsedResponse = TestService.parseResponse(svc, response);

      expect(parsedResponse).to.equal(response);
      expect(svc.client.succeeded.calledOnce).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should throw an error if the WebDAV call fails', () => {
      const response = 'response';
      const svc = TestService._createService('default', {});

      TestService.createRequest(svc, {});
      svc.client.succeeded.returns(false);
      svc.client.statusText = 'ERROR';

      expect(() => TestService.parseResponse(svc, response)).to.throw('ERROR');
      expect(svc.client.succeeded.calledOnce).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should handle empty responses gracefully', () => {
      const svc = TestService._createService('default', {});

      TestService.createRequest(svc, {});
      svc.client.succeeded.returns(true);

      const parsedResponse = TestService.parseResponse(svc, null);

      expect(parsedResponse).to.be.null;
      expect(svc.client.succeeded.calledOnce).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });
  });
});
