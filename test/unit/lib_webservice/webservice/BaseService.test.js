'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockResult = mocks['dw/svc/Result'];
const MockService = mocks['dw/svc/Service'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];
const BaseService = mocks['*/cartridge/scripts/webservice/BaseService'];

describe('scripts/webservice/BaseService', () => {
  describe('extend()', () => {
    it('should extend the BaseService and override existing methods and attributes', function () {
      const customFetch = () => {};
      const TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: { default: 'test' },
        fetch: customFetch,
      });

      expect(TestService.SERVICE_CONFIGURATIONS.default).to.equal('test');
      expect(TestService.fetch).to.equal(customFetch);
    });
  });

  describe('fetch()', () => {
    let TestService;

    beforeEach(() => {
      TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: { default: 'test.configuration' },
      });
    });

    it('should work without arguments', () => {
      const result = TestService.fetch();

      expect(result).to.be.instanceOf(MockResult);
    });

    it('should work with only alias in arguments', () => {
      const result = TestService.fetch('default');

      expect(result).to.be.instanceOf(MockResult);
    });

    it('should work with alias and params', () => {
      const result = TestService.fetch('default', {});

      expect(result).to.be.instanceOf(MockResult);
    });

    it('should return error result with empty service configuration', () => {
      TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: { default: '' },
      });

      const result = TestService.fetch('default', {});
      const errorMessage = 'Service: Please define service action for default!';

      expect(result.ok).to.be.false;
      expect(result.errorMessage).to.equal(errorMessage);
    });

    it('should return error result with unknown alias', () => {
      const result = TestService.fetch('unknown', {});
      const errorMessage = 'Service: Please define service action for unknown!';

      expect(result.ok).to.be.false;
      expect(result.errorMessage).to.equal(errorMessage);
    });

    it('should handle successful service call', () => {
      TestService = TestService.extend({
        _createService: () => ({
          call: () => ({ ok: true }),
        }),
      });

      const result = TestService.fetch();

      expect(result.ok).to.be.true;
    });

    it('should handle unsuccessful service call', () => {
      TestService = TestService.extend({
        _createService: () => ({
          call: () => ({ ok: false }),
        }),
      });

      const result = TestService.fetch();

      expect(result.ok).to.be.false;
    });

    it('should handle service call throwing an error', () => {
      TestService = TestService.extend({
        _createService: () => {
          throw new Error('ERROR');
        },
      });

      const result = TestService.fetch();

      expect(result.ok).to.be.false;
      expect(result.errorMessage).to.equal('ERROR');
    });
  });

  describe('_createService()', () => {
    it('should create a service with the correct ID and callbacks when alias is provided', () => {
      const createServiceStub = sinon.stub(MockLocalServiceRegistry, 'createService').returns({});
      const TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: { custom: 'customServiceID' },
      });

      TestService._createService('custom', {});
      expect(createServiceStub.calledOnce).to.be.true;
      expect(createServiceStub.calledWith('customServiceID')).to.be.true;
      createServiceStub.restore();
    });

    it('should create a service with the correct ID and callbacks when alias is not provided', () => {
      const createServiceStub = sinon.stub(MockLocalServiceRegistry, 'createService').returns({});
      const TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: { default: 'defaultServiceID' },
      });

      TestService._createService(undefined, {});
      expect(createServiceStub.calledOnce).to.be.true;
      expect(createServiceStub.calledWith('defaultServiceID')).to.be.true;
      createServiceStub.restore();
    });
  });

  describe('_getServiceID()', () => {
    let TestService;

    beforeEach(() => {
      TestService = BaseService.extend({
        SERVICE_CONFIGURATIONS: {
          default: 'test.configuration',
        },
      });
    });

    it('should return the service ID for a valid alias', () => {
      const serviceId = TestService._getServiceID('default');

      expect(serviceId).to.equal('test.configuration');
    });

    it('should throw an Error for an invalid alias', () => {
      const errorMessage = 'Service: Please define service action for invalidAlias!';

      expect(() => TestService._getServiceID('invalidAlias')).to.throw(errorMessage);
    });
  });

  describe('_getServiceCallback()', () => {
    let TestService;

    beforeEach(() => {
      TestService = BaseService.extend({
        initServiceClient: sinon.spy(),
        createRequest: sinon.spy(),
        execute: sinon.spy(),
        parseResponse: sinon.spy(),
        filterLogMessage: sinon.spy(),
        getRequestLogMessage: sinon.spy(),
        getResponseLogMessage: sinon.spy(),
      });
    });

    it('should create empty service callback', () => {
      const callbacks = TestService._getServiceCallback({});

      for (const method of TestService.SERVICE_CALLBACK_METHODS) {
        expect(callbacks[method]).to.be.a('function');
      }
    });

    it('should create service callback object with mock methods', () => {
      const params = {
        mockCall: () => {},
        mockFull: () => {},
      };
      const callbacks = TestService._getServiceCallback(params);

      for (const method of TestService.SERVICE_CALLBACK_METHODS) {
        expect(callbacks[method]).to.be.a('function');
      }
    });

    it('should bind the common callback methods to the service', () => {
      const callbacks = TestService._getServiceCallback({});

      for (const method of TestService.SERVICE_CALLBACK_METHODS) {
        expect(callbacks[method].name).to.equal(TestService[method].bind(TestService).name);
      }
    });

    it('should bind the mock callback methods to the service', () => {
      const params = {
        mockCall: () => {},
        mockFull: () => {},
      };
      const callbacks = TestService._getServiceCallback(params);

      for (const method of TestService.SERVICE_CALLBACK_MOCK_METHODS) {
        expect(callbacks[method].name).to.equal(params[method].bind(TestService).name);
      }
    });

    it('should not include undefined methods in the callback object', () => {
      const callbacks = TestService._getServiceCallback({
        mockCall: () => {},
      });

      expect(callbacks.mockFull).to.be.undefined;
    });
  });

  describe('_handleErrorResult()', () => {
    it('should transform an error into a structured result', () => {
      const error = new Error('Test Error');
      const result = BaseService._handleErrorResult(error);

      expect(result.status).to.equal('ERROR');
      expect(result.ok).to.be.false;
      expect(result.errorMessage).to.equal('Test Error');
    });
  });

  describe('_handleSuccessResult()', () => {
    it('should return the input result', () => {
      const result = { ok: true };
      const successResult = BaseService._handleSuccessResult(result);

      expect(successResult).to.equal(result);
    });
  });

  describe('_getServiceCredential()', () => {
    it('should return the service credential from the service configuration', () => {
      const svc = new MockService('test.service', {});
      const getServiceCredentialSpy = sinon.spy(BaseService, '_getServiceCredential');
      const params = {};
      const credential = BaseService._getServiceCredential(svc, params);

      expect(getServiceCredentialSpy.calledOnce).to.be.true;
      expect(getServiceCredentialSpy.calledWith(svc, params)).to.be.true;
      expect(credential.user).to.equal('user');
      expect(credential.password).to.equal('password');
      getServiceCredentialSpy.restore();
    });
  });
});
