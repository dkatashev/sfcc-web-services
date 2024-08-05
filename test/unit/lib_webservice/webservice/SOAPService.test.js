'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockMap = mocks['dw/util/Map'];
const MockPort = mocks['dw/ws/Port'];
const MockWSUtil = mocks['dw/ws/WSUtil'];
const SOAPService = mocks['*/cartridge/scripts/webservice/SOAPService'];

global.webreferences2 = {
  MyWebReference: {
    getService: sinon.stub().returns({
      myOperation: sinon.stub().returns('response')
    }),
    defaultService: {
      myOperation: sinon.stub().returns('response')
    },
  }
};

describe('scripts/webservice/SOAPService', () => {
  describe('createRequest()', () => {
    let svc;
    let TestService;

    beforeEach(() => {
      svc = {
        setServiceClient: sinon.spy(),
        webReference: {},
        webReferencePort: {},
        operation: '',
      };

      TestService = SOAPService.extend({
        _addSOAPHeaders: sinon.spy(),
        _setHTTPHeaders: sinon.spy(),
        _setWSSecurityConfig: sinon.spy(),
        _setProperties: sinon.spy(),
      });
    });

    it('should create a SOAP request and set service client', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        getRequest: sinon.stub().returns('request')
      };

      const result = TestService.createRequest(svc, params);

      expect(svc.webReference).to.equal(webreferences2.MyWebReference);
      expect(svc.webReferencePort).to.equal(webreferences2.MyWebReference.defaultService);
      expect(svc.operation).to.equal('myOperation');
      expect(svc.setServiceClient.calledOnce).to.be.true;
      expect(result).to.equal('request');
    });

    it('should call custom onCreateRequest callback', () => {
      const params = {
        webReference: 'MyWebReference',
        operation: 'myOperation',
        onCreateRequest: sinon.spy(),
        getRequest: sinon.stub().returns('request')
      };

      TestService.createRequest(svc, params);
      expect(params.onCreateRequest.calledOnce).to.be.true;
    });

    it('should set service client with custom service', () => {
      const params = {
        webReference: 'MyWebReference',
        service: { name: 'customService', port: 'customPort' },
        operation: 'myOperation',
        getRequest: sinon.stub().returns('request')
      };

      TestService.createRequest(svc, params);

      expect(svc.webReferencePort).to.equal(webreferences2.MyWebReference.getService('customService', 'customPort'));
    });
  });

  describe('execute()', () => {
    let svc;
    let TestService;

    beforeEach(() => {
      svc = {
        serviceClient: {
          myOperation: sinon.stub().returns('response')
        },
        operation: 'myOperation'
      };

      TestService = SOAPService.extend();
    });

    it('should execute the SOAP service request and return the response', () => {
      const requestObject = {};
      const result = TestService.execute(svc, requestObject);
      expect(svc.serviceClient.myOperation.calledWith(requestObject)).to.be.true;
      expect(result).to.equal('response');
    });
  });

  describe('parseResponse()', () => {
    let svc;
    let TestService;

    beforeEach(() => {
      svc = {};
      TestService = SOAPService.extend();
    });

    it('should return the response object as is', () => {
      const responseObject = { key: 'value' };
      const result = TestService.parseResponse(svc, responseObject);
      expect(result).to.equal(responseObject);
    });
  });

  describe('_addSOAPHeaders()', () => {
    let svc;
    let TestService;
    let addSOAPHeaderStub;

    beforeEach(() => {
      svc = {
        serviceClient: {}
      };
      TestService = SOAPService.extend();
      addSOAPHeaderStub = sinon.stub(MockWSUtil, 'addSOAPHeader');
    });

    afterEach(() => {
      addSOAPHeaderStub.restore();
    });

    it('should add SOAP headers to the service client', () => {
      const soapHeaders = [
        { header: '<Header1/>', mustUnderstand: true, actor: 'actor1' },
        { header: '<Header2/>', mustUnderstand: false, actor: 'actor2' }
      ];

      TestService._addSOAPHeaders(svc, soapHeaders);
      expect(addSOAPHeaderStub.calledWith(svc.serviceClient, '<Header1/>', true, 'actor1')).to.be.true;
      expect(addSOAPHeaderStub.calledWith(svc.serviceClient, '<Header2/>', false, 'actor2')).to.be.true;
    });

    it('should handle empty SOAP headers to the service client', () => {
      const soapHeaders = null;

      TestService._addSOAPHeaders(svc, soapHeaders);
      expect(addSOAPHeaderStub.calledOnce).to.be.false;
    });
  });

  describe('_setHTTPHeaders()', () => {
    let svc;
    let TestService;
    let setHTTPRequestHeaderStub;

    beforeEach(() => {
      svc = {
        serviceClient: {}
      };
      TestService = SOAPService.extend();
      setHTTPRequestHeaderStub = sinon.stub(MockWSUtil, 'setHTTPRequestHeader')
    });

    afterEach(() => {
      setHTTPRequestHeaderStub.restore();
    });

    it('should set HTTP headers for the service client', () => {
      const httpHeaders = {
        'Content-Type': 'application/soap+xml',
        'Custom-Header': 'CustomValue'
      };

      TestService._setHTTPHeaders(svc, httpHeaders);
      expect(setHTTPRequestHeaderStub.calledWith(svc.serviceClient, 'Content-Type', 'application/soap+xml')).to.be.true;
      expect(setHTTPRequestHeaderStub.calledWith(svc.serviceClient, 'Custom-Header', 'CustomValue')).to.be.true;
    });

    it('should handle empty HTTP headers for the service client', () => {
      const httpHeaders = null;

      TestService._setHTTPHeaders(svc, httpHeaders);
      expect(setHTTPRequestHeaderStub.calledOnce).to.be.false;
    });
  });

  describe('_setWSSecurityConfig()', () => {
    let svc;
    let TestService;
    let setWSSecurityConfigStub;

    beforeEach(() => {
      svc = {
        serviceClient: {}
      };
      TestService = SOAPService.extend();
      setWSSecurityConfigStub = sinon.stub(MockWSUtil, 'setWSSecurityConfig');
    });

    afterEach(() => {
      setWSSecurityConfigStub.restore();
    });

    it('should set WS-Security configuration for the service client', () => {
      const securityConfig = {
        requestConfigMap: new MockMap(),
        responseConfigMap: new MockMap(),
      };

      TestService._setWSSecurityConfig(svc, securityConfig);
      expect(setWSSecurityConfigStub.calledWith(svc.serviceClient, securityConfig.requestConfigMap, securityConfig.responseConfigMap)).to.be.true;
    });

    it('should handle empty WS-Security configuration for the service client', () => {
      const securityConfig = null;

      TestService._setWSSecurityConfig(svc, securityConfig);
      expect(setWSSecurityConfigStub.calledOnce).to.be.false;
    });
  });

  describe('_setProperties()', () => {
    let svc;
    let TestService;
    let setPropertyStub;

    beforeEach(() => {
      svc = {
        serviceClient: {}
      };
      TestService = SOAPService.extend();
      setPropertyStub = sinon.stub(MockWSUtil, 'setProperty');
    });

    afterEach(() => {
      setPropertyStub.restore();
    });

    it('should set SOAP properties for the service client', () => {
      const properties = {
        encoding: 'UTF-8',
        session: true,
      };

      TestService._setProperties(svc, properties);
      expect(setPropertyStub.calledWith(MockPort.ENCODING, 'UTF-8', svc.serviceClient)).to.be.true;
      expect(setPropertyStub.calledWith(MockPort.SESSION_MAINTAIN_PROPERTY, true, svc.serviceClient)).to.be.true;
    });

    it('should not set unknown SOAP properties for the service client', () => {
      const properties = {
        unknown: 'unknown',
      };

      TestService._setProperties(svc, properties);
      expect(setPropertyStub.calledOnce).to.be.false;
    });

    it('should handle empty SOAP properties for the service client', () => {
      const properties = null;

      TestService._setProperties(svc, properties);
      expect(setPropertyStub.calledOnce).to.be.false;
    });
  });
});
