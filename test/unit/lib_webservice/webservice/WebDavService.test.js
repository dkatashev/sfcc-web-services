'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockWebDAVClient = mocks['dw/net/WebDAVClient'];
const MockServiceCredential = mocks['dw/svc/ServiceCredential'];
const WebDavService = mocks['*/cartridge/scripts/webservice/WebDavService'];

describe('scripts/webservice/WebDavService', () => {
  let svc;
  let TestService;
  let serviceCredential;

  beforeEach(() => {
    svc = {
      URL: '',
      setURL: sinon.spy(),
      client: null,
    };
    serviceCredential = new MockServiceCredential('webdav.credentials', 'https://test.com/');
    TestService = WebDavService.extend({
      _getServiceCredential: sinon.stub().returns(serviceCredential),
    });
  });

  describe('createRequest()', () => {
    it('should create a request with default parameters', () => {
      const params = {};
      const result = TestService.createRequest(svc, params);

      expect(svc.setURL.calledWith('https://test.com/')).to.be.true;
      expect(svc.client).to.be.instanceOf(MockWebDAVClient);
      expect(result).to.equal(params);
    });

    it('should create a request without authentication', () => {
      serviceCredential.user = null;
      serviceCredential.password = null;

      const params = {};
      const result = TestService.createRequest(svc, params);

      expect(svc.setURL.calledWith('https://test.com/')).to.be.true;
      expect(svc.client).to.be.instanceOf(MockWebDAVClient);
      expect(result).to.equal(params);
    });

    it('should replace path patterns in URL', () => {
      const params = { pathPatterns: { id: '123' } };

      serviceCredential.URL = 'https://test.com/:id';
      TestService.createRequest(svc, params);

      expect(svc.setURL.calledWith('https://test.com/123')).to.be.true;
    });

    it('should add headers to the request', () => {
      const params = { headers: { 'Content-Type': 'application/json' } };

      TestService.createRequest(svc, params);

      expect(svc.client.allRequestHeaders.get('Content-Type')).to.equal('application/json');
    });

    it('should call onCreateRequest callback', () => {
      const mockOnCreateRequest = sinon.spy();
      const params = { onCreateRequest: mockOnCreateRequest };

      TestService.createRequest(svc, params);

      expect(mockOnCreateRequest.calledOnce).to.be.true;
    });
  });

  describe('execute()', () => {
    it('should execute a single operation and close the client', () => {
      const params = { operation: 'get', args: ['path/to/resource'] };

      svc.client = {
        get: sinon.spy(),
        close: sinon.spy(),
      };
      TestService.execute(svc, params);

      expect(svc.client.get.calledWith('path/to/resource')).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should execute multiple operations using onExecute callback and close the client', () => {
      const mockOnExecute = sinon.spy();
      const params = { onExecute: mockOnExecute };

      svc.client = {
        close: sinon.spy(),
      };
      TestService.execute(svc, params);

      expect(mockOnExecute.calledWith(svc)).to.be.true;
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should throw an error if the WebDAV call fails', () => {
      const params = { operation: 'get', args: ['invalid/path'] };

      svc.client = {
        get: sinon.stub().throws(new Error('WebDAV call failed')),
        close: sinon.spy(),
      };

      expect(() => TestService.execute(svc, params)).to.throw('WebDAV call failed');
      expect(svc.client.close.calledOnce).to.be.true;
    });
  });

  describe('parseResponse()', () => {
    it('should throw an error if the WebDAV call failed', () => {
      svc.client = {
        succeeded: sinon.stub().returns(false),
        statusCode: 404,
        statusText: 'Not Found',
        close: sinon.spy(),
      };

      expect(() => TestService.parseResponse(svc, {})).to.throw(svc.client.statusText);
      expect(svc.client.close.calledOnce).to.be.true;
    });

    it('should return the response if the WebDAV call succeeded', () => {
      svc.client = {
        succeeded: sinon.stub().returns(true),
        statusCode: 200,
        statusText: '',
        close: sinon.spy(),
      };

      const response = {};
      const result = TestService.parseResponse(svc, response);

      expect(result).to.equal(response);
      expect(svc.client.close.calledOnce).to.be.true;
    });
  });
});
