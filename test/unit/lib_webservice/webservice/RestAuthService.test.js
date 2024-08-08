'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockXML = mocks['global/XML'];
const MockBytes = mocks['dw/util/Bytes'];
const MockResult = mocks['dw/svc/Result'];
const MockEncoding = mocks['dw/crypto/Encoding'];
const MockCache = mocks['dw/system/Cache'];
const MockCacheMgr = mocks['dw/system/CacheMgr'];
const MockHTTPRequestPart = mocks['dw/net/HTTPRequestPart'];
const MockLocalServiceRegistry = mocks['dw/svc/LocalServiceRegistry'];

global.XML = MockXML;

const ByteStream = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
  'dw/util/Bytes': MockBytes,
});
const contentHeader = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/contentHeader', {});
const headers = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {});
const urlencoded = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/urlencoded', {
  'dw/crypto/Encoding': MockEncoding,
});
const multipart = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/multipart', {
  'dw/util/Bytes': MockBytes,
  '*/cartridge/scripts/util/headers': headers,
  '*/cartridge/scripts/util/ByteStream': ByteStream,
});
const BaseService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
  'dw/svc/LocalServiceRegistry': MockLocalServiceRegistry,
});
const RestService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/RestService', {
  'dw/net/HTTPRequestPart': MockHTTPRequestPart,
  '*/cartridge/scripts/webservice/BaseService': BaseService,
  '*/cartridge/scripts/util/contentHeader': contentHeader,
  '*/cartridge/scripts/util/urlencoded': urlencoded,
  '*/cartridge/scripts/util/multipart': multipart,
});
const RestAuthService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/RestAuthService', {
  'dw/system/CacheMgr': MockCacheMgr,
  '*/cartridge/scripts/webservice/RestService': RestService,
});

describe('scripts/webservice/RestAuthService', () => {
  const config = {
    CACHE_ID: 'testCacheId',
    CACHE_KEY: 'testCacheKey',
  };
  let TestService;

  beforeEach(() => {
    TestService = RestAuthService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'http.default',
        alias: 'http.alias',
      },
      CACHE_ID: config.CACHE_ID,
      CACHE_KEY: config.CACHE_KEY,
    });
  });

  describe('#authorize()', () => {
    it('should perform authorization using the auth service action', () => {
      const object = { token_type: 'Bearer', access_token: 'token' };
      const params = {
        method: 'POST',
        dataType: 'form',
        data: { grant_type: 'client_credentials' }
      };

      TestService = TestService.extend({
        fetch: sinon.stub().returns(new MockResult(MockResult.OK, object)),
      });

      const result = TestService.authorize();

      expect(TestService.fetch.calledOnce).to.be.true;
      expect(TestService.fetch.calledWith('auth', sinon.match(params))).to.be.true;
      expect(result.ok).to.be.true;
    });
  });

  describe('#getAuthentication()', () => {
    beforeEach(() => {
      TestService = TestService.extend({
        authorize: sinon.stub(),
      });
    });

    it('should return authentication from cache if available', () => {
      const authData = { type: 'Bearer', credentials: 'testToken' };
      const cache = new MockCache({ [config.CACHE_KEY]: authData });

      MockCacheMgr.store[config.CACHE_ID] = cache;

      const authentication = TestService.getAuthentication();

      expect(authentication).to.equal(authData);
    });

    it('should call authorize and store authentication in cache if not available', () => {
      const data = { token_type: 'Bearer', access_token: 'testToken' };
      const result = new MockResult(MockResult.OK, data);

      MockCacheMgr.store[config.CACHE_ID] = new MockCache();
      TestService.authorize.returns(result);

      const authentication = TestService.getAuthentication();

      expect(TestService.authorize.calledOnce).to.be.true;
      expect(authentication.type).to.equal(data.token_type);
      expect(authentication.credentials).to.equal(data.access_token);
    });

    it('should throw an error if authorization fails', () => {
      const result = new MockResult(MockResult.ERROR, {});

      MockCacheMgr.store[config.CACHE_ID] = new MockCache();
      TestService.authorize.returns(result);

      expect(() => TestService.getAuthentication()).to.throw(result.errorMessage);
    });
  });
});
