'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockPort = mocks['dw/ws/Port'];
const MockWSUtil = mocks['dw/ws/WSUtil'];
const MockWebReference2 = mocks['dw/ws/WebReference2'];
const MockSOAPService = mocks['dw/svc/SOAPService'];
const MockHashMap = mocks['dw/util/HashMap'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

global.webreferences2 = {
  MyWebReference: new MockWebReference2({
    defaultService: new MockPort(['myOperation']),
    myService: {
      myPort: new MockPort(['myOperation']),
    }
  }, ['TestRequest']),
};

const BaseService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
  'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
});
const SOAPService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/SOAPService', {
  'dw/ws/Port': MockPort,
  'dw/ws/WSUtil': MockWSUtil,
  '*/cartridge/scripts/webservice/BaseService': BaseService,
});

describe('scripts/webservice/SOAPService', () => {
  let TestService;

  beforeEach(() => {
    TestService = SOAPService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'soap.service',
      },
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#createRequest()', () => {
    it('should create a SOAP request and set headers, properties, and security config', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        service: { name: 'myService', port: 'myPort' },
        soapHeaders: [{ header: '<header>', mustUnderstand: true, actor: 'uri' }],
        httpHeaders: { 'Content-Type': 'application/soap+xml' },
        securityConfig: { requestConfigMap: new MockHashMap(), responseConfigMap: new MockHashMap() },
        properties: { encoding: 'UTF-8', session: true, unknown: 'unknown' },
        getRequest: (svc, webReference) => {
          const request = new webReference.TestRequest();
          return request;
        }
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      expect(svc.webReference).to.equal(webreferences2.MyWebReference);
      expect(svc.webReferencePort).to.equal(webreferences2.MyWebReference.getService(params.service.name, params.service.port));
      expect(svc.operation).to.equal(params.operation);
      expect(svc.serviceClient).to.equal(svc.webReferencePort);
      expect(MockWSUtil.addSOAPHeader.calledWith(svc.serviceClient, '<header>', true, 'uri')).to.be.true;
      expect(MockWSUtil.setHTTPRequestHeader.calledWith(svc.serviceClient, 'Content-Type', 'application/soap+xml')).to.be.true;
      expect(MockWSUtil.setWSSecurityConfig.calledWith(svc.serviceClient, params.securityConfig.requestConfigMap, params.securityConfig.requestConfigMap)).to.be.true;
      expect(MockWSUtil.setProperty.calledWith(MockPort.ENCODING, params.properties.encoding, svc.serviceClient)).to.be.true;
      expect(MockWSUtil.setProperty.calledWith(MockPort.SESSION_MAINTAIN_PROPERTY, params.properties.session, svc.serviceClient)).to.be.true;
      expect(svc.webReference.TestRequest.calledWithNew()).to.be.true;
    });

    it('should call onCreateRequest callback if provided', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        onCreateRequest: sinon.stub(),
        getRequest: sinon.stub().returns('requestObject')
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      expect(params.onCreateRequest.calledOnceWith(params, svc)).to.be.true;
    });

    it('should use defaultService if no service is provided', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        getRequest: sinon.stub().returns('requestObject')
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      expect(svc.webReferencePort).to.equal(webreferences2.MyWebReference.defaultService);
    });

    it('should handle default case in createRequest', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        getRequest: sinon.stub().returns('requestObject')
      };
      const svc = TestService._createService('default', params);

      TestService.createRequest(svc, params);

      expect(svc).to.be.instanceOf(MockSOAPService);
    });
  });

  describe('#execute()', () => {
    it('should execute the SOAP service request', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        getRequest: sinon.stub().returns('requestObject')
      };
      const svc = TestService._createService('default', params);
      const port = webreferences2.MyWebReference.defaultService;

      TestService.createRequest(svc, params);
      port[params.operation].returns('response');

      const response = TestService.execute(svc, 'requestObject');

      expect(response).to.equal('response');
      expect(svc.serviceClient.myOperation.calledWith('requestObject')).to.be.true;
    });
  });

  describe('#parseResponse()', () => {
    it('should parse the SOAP service response', () => {
      const responseObject = 'responseObject';
      const parsedResponse = TestService.parseResponse(null, responseObject);

      expect(parsedResponse).to.equal(responseObject);
    });
  });
});
