'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockBytes = mocks['dw/util/Bytes'];
const MockHTTPRequestPart = mocks['dw/net/HTTPRequestPart'];
const MockServiceCredential = mocks['dw/svc/ServiceCredential'];
const RestService = mocks['*/cartridge/scripts/webservice/RestService'];

global.XML = class XML {
  constructor(xmlString) {
    this.xmlString = xmlString;
  }

  toXMLString() {
    return this.xmlString;
  }
};

describe('scripts/webservice/RestService', () => {
  describe('createRequest()', () => {
    let svc;
    let TestService;
    let serviceCredential;

    beforeEach(() => {
      svc = {
        setRequestMethod: sinon.spy(),
        setURL: sinon.spy(),
        addParam: sinon.spy(),
        addHeader: sinon.spy(),
        setOutFile: sinon.spy(),
        setIdentity: sinon.spy(),
        setEncoding: sinon.spy(),
        setCachingTTL: sinon.spy(),
        setAuthentication: sinon.spy(),
      };

      serviceCredential = new MockServiceCredential();
      serviceCredential.ID = 'http.rest.service.credentials';
      serviceCredential.URL = 'https://test.com/';

      TestService = RestService.extend({
        SERVICE_CONFIGURATIONS: {
          default: 'http.rest.service',
        },
        _getServiceCredential: sinon.stub().returns(serviceCredential),
        _createRequestBody: sinon.stub().returns('requestBody'),
        _setAuthorizationHeader: sinon.spy(),
      });
    });

    it('should create a GET HTTP request by default', () => {
      const params = {};
      const result = TestService.createRequest(svc, params);

      expect(svc.setRequestMethod.calledWith('GET')).to.be.true;
      expect(svc.setURL.calledWith('https://test.com/')).to.be.true;
      expect(result).to.be.undefined;
    });

    it('should create a POST HTTP request with body', () => {
      const params = { method: 'POST' };
      const result = TestService.createRequest(svc, params);

      expect(svc.setRequestMethod.calledWith('POST')).to.be.true;
      expect(svc.setURL.calledWith('https://test.com/')).to.be.true;
      expect(result).to.equal('requestBody');
    });

    it('should call custom onCreateRequest callback', () => {
      const mockOnCreateRequest = sinon.spy();
      const params = { onCreateRequest: mockOnCreateRequest };

      TestService.createRequest(svc, params);
      expect(mockOnCreateRequest.calledOnce).to.be.true;
    });

    it('should replace path patterns in URL', () => {
      const params = { pathPatterns: { id: '123' } };

      serviceCredential.URL = 'http://test.com/:id';
      TestService.createRequest(svc, params);
      expect(svc.setURL.calledWith('http://test.com/123')).to.be.true;
    });

    it('should add query params to service', () => {
      const params = { queryParams: { param: 'value' } };

      TestService.createRequest(svc, params);
      expect(svc.addParam.calledWith('param', 'value')).to.be.true;
    });

    it('should add headers to service', () => {
      const params = { headers: { Accept: 'application/json' } };

      TestService.createRequest(svc, params);
      expect(svc.addHeader.calledWith('Accept', 'application/json')).to.be.true;
    });

    it('should call custom getAuthentication callback and replace auth in params', () => {
      const auth = { type: 'Bearer', credentials: 'token' };
      const mockGetAuthentication = sinon.stub().returns(auth);
      const params = { getAuthentication: mockGetAuthentication };

      TestService.createRequest(svc, params);
      expect(mockGetAuthentication.calledOnce).to.be.true;
      expect(TestService._setAuthorizationHeader.calledOnce).to.be.true;
      expect(TestService._setAuthorizationHeader.calledWith(svc, auth)).to.be.true;
    });

    it('should add other configurations to service', () => {
      const params = {
        outFile: {},
        keyRef: {},
        encoding: 'UTF-8',
        ttl: 0,
      };

      TestService.createRequest(svc, params);
      expect(svc.setOutFile.calledWith(params.outFile)).to.be.true;
      expect(svc.setIdentity.calledWith(params.keyRef)).to.be.true;
      expect(svc.setEncoding.calledWith(params.encoding)).to.be.true;
      expect(svc.setCachingTTL.calledWith(params.ttl)).to.be.true;
    });
  });

  describe('_setAuthorizationHeader()', () => {
    it('should set the Authorization header correctly', () => {
      const svc = {
        setAuthentication: sinon.spy(),
        addHeader: sinon.spy(),
      };
      const auth = { type: 'Bearer', credentials: 'test_token' };

      RestService._setAuthorizationHeader(svc, auth);
      expect(svc.setAuthentication.calledWith('NONE')).to.be.true;
      expect(svc.addHeader.calledWith('Authorization', 'Bearer test_token')).to.be.true;
    });

    it('should only reset Authentication if auth is an empty object', () => {
      const svc = {
        setAuthentication: sinon.spy(),
        addHeader: sinon.spy(),
      };

      RestService._setAuthorizationHeader(svc, {});
      expect(svc.setAuthentication.calledWith('NONE')).to.be.true;
      expect(svc.addHeader.calledOnce).to.be.false;
    });
  });

  describe('_createRequestBody()', () => {
    let svc;

    beforeEach(() => {
      svc = { addHeader: sinon.spy() };
    });

    it('should create a JSON request body', () => {
      const data = { key: 'value' };
      const result = RestService._createRequestBody(svc, undefined, data);

      expect(svc.addHeader.calledWith('Content-Type', 'application/json')).to.be.true;
      expect(result).to.equal(JSON.stringify(data));
    });

    it('should create a form request body', () => {
      const result = RestService._createRequestBody(svc, 'form', { key: 'value' });

      expect(svc.addHeader.calledWith('Content-Type', 'application/x-www-form-urlencoded')).to.be
        .true;
      expect(result).to.equal('key=value');
    });

    it('should create an XML request body from string', () => {
      const data = '<?xml version="1.0" encoding="UTF-8"?><node>Test</node>';
      const result = RestService._createRequestBody(svc, 'xml', data);

      expect(svc.addHeader.calledWith('Content-Type', 'application/xml')).to.be.true;
      expect(result).to.equal(data);
    });

    it('should create an XML request body from XML object', () => {
      const xmlString = '<?xml version="1.0" encoding="UTF-8"?><node>Test</node>';
      const data = new XML();
      const toXMLStringStub = sinon.stub(data, 'toXMLString').returns(xmlString);
      const result = RestService._createRequestBody(svc, 'xml', data);

      expect(svc.addHeader.calledWith('Content-Type', 'application/xml')).to.be.true;
      expect(toXMLStringStub.calledOnce).to.be.true;
      expect(result).to.equal(xmlString);
    });

    it('should create a Form-Data request body', () => {
      const parts = [
        new MockHTTPRequestPart('firstName', 'John'),
        new MockHTTPRequestPart('lastName', 'Doe'),
      ];
      const result = RestService._createRequestBody(svc, 'multipart', parts);

      expect(svc.addHeader.calledOnce).to.be.false;
      expect(result).to.equal(parts);
    });

    it('should throw an error if invalid Form-Data request body', () => {
      const parts = [{}, {}];
      const errorMessage = 'Incorrect "data". It should be array of dw.net.HTTPRequestPart.';

      expect(() => RestService._createRequestBody(svc, 'multipart', parts)).to.throw(
        TypeError,
        errorMessage,
      );
    });

    it('should create a Mixed request body', () => {
      const data = {
        boundary: 'boundary',
        parts: [
          {
            headers: { 'content-type': 'text/plain' },
            body: new MockBytes('Part1'),
          },
          {
            headers: { 'content-type': 'text/html' },
            body: new MockBytes('Part2'),
          },
        ],
      };
      const result = RestService._createRequestBody(svc, 'mixed', data);

      expect(result).to.include('Part1');
      expect(result).to.include('Part2');
      expect(result).to.include('--boundary');
      expect(result).to.include('--boundary--');
    });

    it('should create a raw request body', () => {
      const data = 'rawBody';
      const result = RestService._createRequestBody(svc, 'raw', data);

      expect(svc.addHeader.calledOnce).to.be.false;
      expect(result).to.equal(data);
    });
  });

  describe('parseResponse()', () => {
    let svc;
    let response;
    let TestService;

    beforeEach(() => {
      svc = {};

      response = {
        getResponseHeader: sinon.stub(),
        text: '',
        bytes: new MockBytes(''),
      };

      TestService = RestService.extend();
    });

    it('should parse JSON response', () => {
      response.getResponseHeader.returns('application/json');
      response.text = '{"key": "value"}';

      const result = TestService.parseResponse(svc, response);
      expect(result).to.deep.equal({ key: 'value' });
    });

    it('should parse XML response', () => {
      response.getResponseHeader.returns('application/xml');
      response.text = '<root><key>value</key></root>';

      const result = TestService.parseResponse(svc, response);
      expect(result).to.be.an.instanceof(XML);
      expect(result.toXMLString()).to.equal('<root><key>value</key></root>');
    });

    it('should parse URL-encoded response', () => {
      response.getResponseHeader.returns('application/x-www-form-urlencoded');
      response.text = 'key=value';

      const result = TestService.parseResponse(svc, response);
      expect(result).to.deep.equal({ key: 'value' });
    });

    it('should parse multipart/form-data response', () => {
      response.getResponseHeader.returns('multipart/form-data; boundary=boundary');
      response.bytes = new MockBytes(
        '--boundary\r\n\r\n\r\nvalue\r\n--boundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n--boundary--',
      );

      const result = TestService.parseResponse(svc, response);
      expect(result).to.deep.equal([
        {
          headers: {},
          body: { name: undefined, filename: undefined, data: 'value' },
        },
        {
          headers: { 'content-disposition': 'form-data; name="key"' },
          body: { name: 'key', filename: undefined, data: 'value' },
        },
      ]);
    });

    it('should parse multipart/mixed response', () => {
      response.getResponseHeader.returns('multipart/mixed; boundary=boundary');
      response.bytes = new MockBytes(
        '--boundary\r\nContent-Type: application/json\r\n\r\n{"key": "value"}\r\n--boundary\r\n\r\n\r\nrawText\r\n--boundary--',
      );

      const result = TestService.parseResponse(svc, response);
      expect(result).to.deep.equal([
        { headers: { 'content-type': 'application/json' }, body: { key: 'value' } },
        { headers: {}, body: 'rawText' },
      ]);
    });

    it('should handle application/octet-stream response', () => {
      response.getResponseHeader.returns('application/octet-stream');
      response.bytes = new MockBytes('binarydata');

      const result = TestService.parseResponse(svc, response);
      expect(result).to.equal(response.bytes);
    });

    it('should handle plain text response', () => {
      response.getResponseHeader.returns('text/plain');
      response.text = 'plain text response';

      const result = TestService.parseResponse(svc, response);
      expect(result).to.equal('plain text response');
    });

    it('should return raw response if content-type is not recognized', () => {
      response.getResponseHeader.returns(undefined);
      response.text = 'raw response';

      const result = TestService.parseResponse(svc, response);
      expect(result).to.equal('raw response');
    });
  });
});
