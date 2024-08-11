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
  let svc;

  const defaultParams = {
    webReference: 'MyWebReference',
    operation: 'myOperation',
    createRequestPayload: (s, webReference) => new webReference.TestRequest(),
    parseResponsePayload: (s, responsePayload) => responsePayload,
  };

  beforeEach(() => {
    TestService = SOAPService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'soap.service',
      },
    });
    svc = TestService._createService('default', {});
    MockWSUtil._stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#createRequest()', () => {
    it('should create a request payload correctly', () => {
      const params = { ...defaultParams };
      const payload = TestService.createRequest(svc, params);

      expect(svc).to.be.instanceOf(MockSOAPService);
      expect(payload).to.be.instanceOf(global.webreferences2.MyWebReference.TestRequest);
    });

    it('should set SOAP headers and HTTP headers correctly', () => {
      const params = {
        ...defaultParams,
        service: { name: 'myService', port: 'myPort' },
        soapHeaders: [{ header: '<header>', mustUnderstand: true, actor: 'uri' }],
        httpHeaders: { 'Content-Type': 'application/soap+xml' },
      };

      TestService.createRequest(svc, params);

      expect(MockWSUtil.addSOAPHeader.calledWith(svc.serviceClient, '<header>', true, 'uri')).to.be.true;
      expect(MockWSUtil.setHTTPRequestHeader.calledWith(svc.serviceClient, 'Content-Type', 'application/soap+xml')).to.be.true;
    });

    it('should set property configurations correctly', () => {
      const params = {
        ...defaultParams,
        service: { name: 'myService', port: 'myPort' },
        properties: {
          encoding: 'UTF-8',
          endpoint: 'test',
          session: true,
          username: 'username',
          password: 'password',
          unknown: 'unknown'
        },
      };

      TestService.createRequest(svc, params);

      expect(
        MockWSUtil.setProperty.calledWith(
          MockPort.ENCODING,
          params.properties.encoding,
          svc.serviceClient,
        ),
      ).to.be.true;
      expect(
        MockWSUtil.setProperty.calledWith(
          MockPort.ENDPOINT_ADDRESS_PROPERTY,
          params.properties.endpoint,
          svc.serviceClient,
        ),
      ).to.be.true;
      expect(
        MockWSUtil.setProperty.calledWith(
          MockPort.SESSION_MAINTAIN_PROPERTY,
          params.properties.session,
          svc.serviceClient,
        ),
      ).to.be.true;
      expect(
        MockWSUtil.setProperty.calledWith(
          MockPort.USERNAME_PROPERTY,
          params.properties.username,
          svc.serviceClient,
        ),
      ).to.be.true;
      expect(
        MockWSUtil.setProperty.calledWith(
          MockPort.PASSWORD_PROPERTY,
          params.properties.password,
          svc.serviceClient,
        ),
      ).to.be.true;
    });

    it('should set security configurations correctly', () => {
      const params = {
        ...defaultParams,
        securityConfig: {
          requestConfigMap: new MockHashMap(),
          responseConfigMap: new MockHashMap(),
        },
      };

      TestService.createRequest(svc, params);

      expect(
        MockWSUtil.setWSSecurityConfig.calledWith(
          svc.serviceClient,
          params.securityConfig.requestConfigMap,
          params.securityConfig.responseConfigMap
        )
      ).to.be.true;
    });

    it('should call onCreateRequest if provided', () => {
      const params = {
        ...defaultParams,
        onCreateRequest: sinon.stub(),
      };

      TestService.createRequest(svc, params);

      expect(params.onCreateRequest.calledOnce).to.be.true;
    });
  });

  describe('#execute()', () => {
    it('should execute the service operation correctly', () => {
      const params = {
        ...defaultParams,
        createRequestPayload: sinon.stub().returns('requestPayload'),
      };
      const request = TestService.createRequest(svc, params);
      svc.serviceClient[params.operation].returns('responsePayload');
      const response = TestService.execute(svc, request);

      expect(svc.serviceClient.myOperation.calledOnce).to.be.true;
      expect(response).to.equal('responsePayload');
    });

    it('should call executeRequest if provided', () => {
      const params = {
        ...defaultParams,
        executeRequest: sinon.stub().returns('customResponse'),
      };
      const request = TestService.createRequest(svc, params);
      svc.serviceClient[params.operation].returns('responsePayload');
      const response = TestService.execute(svc, request);

      expect(params.executeRequest.calledOnce).to.be.true;
      expect(response).to.equal('customResponse');
    });
  });

  describe('#parseResponse()', () => {
    it('should parse the response payload correctly using parseResponsePayload', () => {
      const params = {
        ...defaultParams,
        parseResponsePayload: sinon.stub().returns('parsedResponse'),
      };
      TestService.createRequest(svc, params);
      const response = TestService.parseResponse(svc, 'responsePayload');

      expect(params.parseResponsePayload.calledWith(svc, 'responsePayload')).to.be.true;
      expect(response).to.equal('parsedResponse');
    });

    it('should return the original response payload if parseResponsePayload is not provided', () => {
      const params = {
        ...defaultParams,
        parseResponsePayload: undefined,
      };
      TestService.createRequest(svc, params);
      const response = TestService.parseResponse(svc, 'responsePayload');

      expect(response).to.equal('responsePayload');
    });
  });
});
