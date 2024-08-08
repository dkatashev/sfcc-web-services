'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockResult = mocks['dw/svc/Result'];
const MockService = mocks['dw/svc/Service'];
const MockServiceCredential = mocks['dw/svc/ServiceCredential'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

const BaseService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
  'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
});

describe('scripts/webservice/BaseService', () => {
  let TestService;
  let params;

  beforeEach(() => {
    TestService = BaseService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'abstract.default',
        alias: 'abstract.alias',
      }
    });
    params = { test: 'param' };
  });

  describe('#extend()', () => {
    it('should extend the base service with additional methods and properties', () => {
      const ExtendedService = BaseService.extend({
        customMethod: () => 'test',
      });

      expect(ExtendedService.customMethod()).to.equal('test');
      expect(ExtendedService.SERVICE_CONFIGURATIONS).to.deep.equal(BaseService.SERVICE_CONFIGURATIONS);
    });
  });

  describe('#fetch()', () => {
    it('should call _createService with alias and return a successful result', () => {
      const result = TestService.fetch('alias', params);

      expect(result).to.be.instanceOf(MockResult);
      expect(result.ok).to.be.true;
    });

    it('should call _createService with default alias and return a successful result', () => {
      const result = TestService.fetch(params);

      expect(result).to.be.instanceOf(MockResult);
      expect(result.ok).to.be.true;
    });

    it('should handle exceptions and return an error result', () => {
      const error = new Error('_createService error');

      TestService = TestService.extend({
        createRequest: () => { throw error; }
      });

      const result = TestService.fetch();

      expect(result).to.be.instanceOf(MockResult);
      expect(result.ok).to.be.false;
    });

    it('should handle exceptions and return an object error result', () => {
      const error = new Error('_createService error');

      TestService = TestService.extend({
        _createService: () => { throw error; }
      });

      const result = TestService.fetch();

      expect(result).to.be.not.instanceOf(MockResult);
      expect(result).to.deep.equal({
        error: -1,
        errorMessage: error.message,
        msg: error.stack,
        object: null,
        ok: false,
        status: 'ERROR',
        unavailableReason: null,
      });
    });
  });

  describe('#_createService()', () => {
    it('should create a service using LocalServiceRegistry', () => {
      const result = TestService._createService('alias', params);

      expect(result).to.be.instanceOf(MockService);
    });

    it('should call _getServiceID with default alias when alias is not provided', () => {
      const result = TestService._createService(undefined, params);

      expect(result).to.be.instanceOf(MockService);
    });
  });

  describe('#_getServiceID()', () => {
    it('should return the service ID for a valid alias', () => {
      const serviceId = TestService._getServiceID('alias');

      expect(serviceId).to.equal('abstract.alias');
    });

    it('should throw an error for an invalid alias', () => {
      expect(() => TestService._getServiceID('invalid')).to.throw('Service: Please define service action for invalid!');
    });
  });

  describe('#_getServiceCallback()', () => {
    it('should return service callback configurations', () => {
      TestService = BaseService.extend({
        initServiceClient: () => {},
        createRequest: () => {},
        execute: () => {},
        parseResponse: () => {},
      });

      const customParams = {
        mockCall: () => {},
      };
      const configCallbacks = TestService._getServiceCallback(customParams);

      expect(configCallbacks.executeOverride).to.be.true;
      expect(configCallbacks.initServiceClient).to.be.a('function');
      expect(configCallbacks.createRequest).to.be.a('function');
      expect(configCallbacks.execute).to.be.a('function');
      expect(configCallbacks.parseResponse).to.be.a('function');
      expect(configCallbacks.mockCall).to.be.a('function');
    });
  });

  describe('#_handleErrorResult()', () => {
    it('should return an error result for a thrown error', () => {
      const error = new Error('Test Error');
      const result = TestService._handleErrorResult(error);

      expect(result).to.deep.equal({
        error: -1,
        errorMessage: error.message,
        msg: error.stack,
        object: null,
        ok: false,
        status: 'ERROR',
        unavailableReason: null,
      });
    });

    it('should return the original result if it is not an error', () => {
      const object = {};
      const result = new MockResult(MockResult.ERROR, object);
      const handledResult = TestService._handleErrorResult(result);

      expect(handledResult).to.equal(result);
      expect(handledResult.ok).to.be.false;
      expect(handledResult.object).to.equal(object);
    });
  });

  describe('#_handleSuccessResult()', () => {
    it('should return the original result for a successful operation', () => {
      const object = {};
      const result = new MockResult(MockResult.OK, object);
      const handledResult = TestService._handleSuccessResult(result);

      expect(handledResult).to.equal(result);
      expect(handledResult.ok).to.be.true;
      expect(handledResult.object).to.equal(object);
    });
  });

  describe('#_getServiceCredential()', () => {
    it('should return the service credential from the service configuration', () => {
      const service = TestService._createService('alias', params);
      const credential = TestService._getServiceCredential(service, params);

      expect(credential).to.be.instanceOf(MockServiceCredential);
    });
  });
});
