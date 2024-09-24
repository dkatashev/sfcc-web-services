'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockXML = mocks['global/XML'];
const MockFile = mocks['dw/io/File'];
const MockList = mocks['dw/util/List'];
const MockBytes = mocks['dw/util/Bytes'];
const MockKeyRef = mocks['dw/crypto/KeyRef'];
const MockEncoding = mocks['dw/crypto/Encoding'];
const MockHTTPClient = mocks['dw/net/HTTPClient'];
const MockHTTPRequestPart = mocks['dw/net/HTTPRequestPart'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

global.XML = MockXML;

const RestService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/RestService', {
  'dw/net/HTTPRequestPart': MockHTTPRequestPart,
  '*/cartridge/scripts/webservice/BaseService': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
    'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
  }),
  '*/cartridge/scripts/util/contentHeader': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/contentHeader', {}),
  '*/cartridge/scripts/util/urlencoded': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/urlencoded', {
    'dw/crypto/Encoding': MockEncoding,
  }),
  '*/cartridge/scripts/util/multipart': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/multipart', {
    'dw/util/Bytes': MockBytes,
    '*/cartridge/scripts/util/headers': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {}),
    '*/cartridge/scripts/util/ByteStream': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
      'dw/util/Bytes': MockBytes,
    }),
  }),
});

describe('scripts/webservice/RestService', () => {
  let TestService;
  let params;
  let svc;

  beforeEach(() => {
    TestService = RestService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'http.default',
        alias: 'http.alias',
      }
    });
    params = {
      method: 'POST',
      pathPatterns: { id: '123' },
      queryParams: { search: 'test' },
      headers: { 'Content-Type': 'application/json' },
      dataType: 'json',
      data: { key: 'value' },
    };
    svc = TestService._createService('default', params);
    svc.configuration.credential.URL = 'https://test.com/:id';
    svc.URL = svc.configuration.credential.URL;
  });

  describe('#createRequest()', () => {
    it('should handle GET method without a request body', () => {
      const customParams = { ...params, method: 'GET' };
      const result = RestService.createRequest(svc, customParams);

      expect(result).to.be.undefined;
    });

    it('should create a POST request with correct URL, method, and headers', () => {
      const result = RestService.createRequest(svc, params);

      expect(svc.requestMethod).to.equal('POST');
      expect(svc.URL).to.equal('https://test.com/123?search=test');
      expect(svc.client.requestHeaders.get('Content-Type')).to.equal('application/json');
      expect(result).to.equal(JSON.stringify(params.data));
    });

    it('should call custom onCreateRequest callback', () => {
      const customParams = { ...params, onCreateRequest: sinon.stub() };

      RestService.createRequest(svc, customParams);

      expect(customParams.onCreateRequest.calledWith(customParams, svc, svc.configuration.credential)).to.be.true;
    });

    it('should call custom getAuthentication callback and set Authorization header', () => {
      const auth = { type: 'Bearer', credentials: 'token' };
      const customParams = { ...params, auth: {}, getAuthentication: sinon.stub().returns(auth) };

      TestService.createRequest(svc, customParams);

      expect(customParams.getAuthentication.calledOnce).to.be.true;
      expect(svc.authentication).to.equal('NONE');
      expect(svc.client.requestHeaders.get('Authorization')).to.equal('Bearer token');
    });

    it('should set Authorization header if auth is provided', () => {
      const customParams = { ...params, auth: { type: 'Bearer', credentials: 'token' } };

      RestService.createRequest(svc, customParams);

      expect(svc.authentication).to.equal('NONE');
      expect(svc.client.requestHeaders.get('Authorization')).to.equal('Bearer token');
    });

    it('should add other configurations to service', () => {
      const customParams = {
        ...params,
        outFile: new MockFile('/IMPEX/test.json'),
        keyRef: new MockKeyRef('test'),
        encoding: 'ASCII',
        ttl: 1000,
      };

      RestService.createRequest(svc, customParams);

      expect(svc.outFile).to.equal(customParams.outFile);
      expect(svc.identity).to.equal(customParams.keyRef);
      expect(svc.encoding).to.equal(customParams.encoding);
      expect(svc.cachingTTL).to.equal(customParams.ttl);
    });
  });

  describe('#_setAuthorizationHeader()', () => {
    it('should set the Authorization header correctly', () => {
      const auth = { type: 'Bearer', credentials: 'token' };

      RestService._setAuthorizationHeader(svc, auth);

      expect(svc.authentication).to.equal('NONE');
      expect(svc.client.requestHeaders.get('Authorization')).to.equal('Bearer token');
    });

    it('should only reset Authentication if auth is an empty object', () => {
      RestService._setAuthorizationHeader(svc, {});

      expect(svc.authentication).to.equal('NONE');
      expect(svc.client.requestHeaders.get('Authorization')).to.be.null;
    });
  });

  describe('#_createRequestBody()', () => {
    it('should create a JSON request body', () => {
      const data = { key: 'value' };
      const result = RestService._createRequestBody(svc, undefined, data);

      expect(svc.client.requestHeaders.get('Content-Type')).to.equal('application/json');
      expect(result).to.equal(JSON.stringify(data));
    });

    it('should create a form request body', () => {
      const result = RestService._createRequestBody(svc, 'form', { key: 'value' });

      expect(svc.client.requestHeaders.get('Content-Type')).to.equal('application/x-www-form-urlencoded');
      expect(result).to.equal('key=value');
    });

    it('should create an XML request body from string', () => {
      const data = '<?xml version="1.0" encoding="UTF-8"?><node>Test</node>';
      const result = RestService._createRequestBody(svc, 'xml', data);

      expect(svc.client.requestHeaders.get('Content-Type')).to.equal('application/xml');
      expect(result).to.equal(data);
    });

    it('should create an XML request body from XML object', () => {
      const data = new XML('<?xml version="1.0" encoding="UTF-8"?><node>Test</node>');
      const result = RestService._createRequestBody(svc, 'xml', data);

      expect(svc.client.requestHeaders.get('Content-Type')).to.equal('application/xml');
      expect(result).to.equal(data.xml);
    });

    it('should create a multipart form-data request body', () => {
      const parts = [
        new MockHTTPRequestPart('firstName', 'John'),
        new MockHTTPRequestPart('lastName', 'Doe'),
      ];
      const result = RestService._createRequestBody(svc, 'multipart', parts);

      expect(svc.client.requestHeaders.get('Content-Type')).to.be.null;
      expect(result).to.equal(parts);
    });

    it('should throw an error if invalid multipart form-data request body', () => {
      const parts = [{}, {}];
      const errorMessage = 'Incorrect "data". It should be array of dw.net.HTTPRequestPart.';

      expect(() => RestService._createRequestBody(svc, 'multipart', parts)).to.throw(TypeError, errorMessage);
    });

    it('should create a mixed request body', () => {
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
      const bodyString = '--boundary\r\ncontent-type: text/plain\r\n\r\nPart1\r\n--boundary\r\ncontent-type: text/html\r\n\r\nPart2\r\n--boundary--';

      expect(svc.client.requestHeaders.get('Content-Type')).to.equal(`multipart/mixed; boundary=${data.boundary}`);
      expect(result).to.equal(bodyString);
    });

    it('should create a raw request body', () => {
      const raw = 'rawBody';
      const result = RestService._createRequestBody(svc, 'raw', raw);

      expect(svc.client.requestHeaders.get('Content-Type')).to.be.null;
      expect(result).to.equal(raw);
    });
  });

  describe('#parseResponse()', () => {
    let response;

    beforeEach(() => {
      response = new MockHTTPClient();
    });

    const testCases = {
      JSON: {
        contentType: 'application/json',
        responseText: '{"key": "value"}',
      },
      XML: {
        contentType: 'application/xml',
        responseText: '<root><key>value</key></root>',
      },
      FORM: {
        contentType: 'application/x-www-form-urlencoded',
        responseText: 'key=value',
      },
      FORM_DATA: {
        contentType: 'multipart/form-data; boundary=boundary',
        responseText: '--boundary\r\n\r\n\r\nvalue\r\n--boundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n--boundary--',
      },
      MIXED: {
        contentType: 'multipart/mixed; boundary=boundary',
        responseText: '--boundary\r\nContent-Type: application/json\r\n\r\n{"key": "value"}\r\n--boundary\r\n\r\n\r\nrawText\r\n--boundary--',
      },
      STREAM: {
        contentType: 'application/octet-stream',
        responseText: 'binarydata',
      },
      TEXT: {
        contentType: 'text/plain',
        responseText: 'plain text response',
      },
    };

    const setResponse = ({ contentType, responseText }) => {
      response.responseHeaders.put('Content-Type', new MockList([contentType]));
      response.responseHeaders.put('Content-Length', new MockList([responseText.length]));
      response.responseHeaders.put('Set-Cookie', new MockList(['cookie1', 'cookie2']));
      response.text = responseText;
    };

    it('should parse JSON response', () => {
      setResponse(testCases.JSON);
      const result = TestService.parseResponse(svc, response);

      expect(result).to.deep.equal({ key: 'value' });
    });

    it('should parse XML response', () => {
      setResponse(testCases.XML);
      const result = TestService.parseResponse(svc, response);

      expect(result).to.be.an.instanceof(XML);
      expect(result.toXMLString()).to.equal('<root><key>value</key></root>');
    });

    it('should parse URL-encoded response', () => {
      setResponse(testCases.FORM);
      const result = TestService.parseResponse(svc, response);

      expect(result).to.deep.equal({ key: 'value' });
    });

    it('should parse multipart/form-data response', () => {
      setResponse(testCases.FORM_DATA);
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
      setResponse(testCases.MIXED);
      const result = TestService.parseResponse(svc, response);

      expect(result).to.deep.equal([
        {
          headers: { 'content-type': 'application/json' },
          body: { key: 'value' },
        },
        {
          headers: {},
          body: 'rawText',
        },
      ]);
    });

    it('should handle application/octet-stream response', () => {
      setResponse(testCases.STREAM);
      const result = TestService.parseResponse(svc, response);

      expect(result.toString()).to.equal(response.text);
    });

    it('should handle plain text response', () => {
      setResponse(testCases.TEXT);
      const result = TestService.parseResponse(svc, response);

      expect(result).to.equal(response.text);
    });

    it('should return raw response if content-type is not recognized', () => {
      const responseText = 'raw response';
      response.text = responseText;
      const result = TestService.parseResponse(svc, response);

      expect(result).to.equal(response.text);
    });
  });
});
