const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const mocks = require('../../../mocks');

const MockXML = mocks['global/XML'];
const MockBytes = mocks['dw/util/Bytes'];
const MockResult = mocks['dw/svc/Result'];
const MockCache = mocks['dw/system/Cache'];
const MockCacheMgr = mocks['dw/system/CacheMgr'];

global.XML = MockXML;

const RestAuthService = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/RestAuthService', {
  'dw/system/CacheMgr': MockCacheMgr,
  'dw/util/Bytes': MockBytes,
  'dw/svc/Result': MockResult,
  '*/cartridge/scripts/webservice/RestService': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/RestService', {
    'dw/net/HTTPRequestPart': mocks['dw/net/HTTPRequestPart'],
    '*/cartridge/scripts/webservice/BaseService': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/webservice/BaseService', {
      'dw/svc/LocalServiceRegistry': mocks['dw/svc/LocalServiceRegistry'],
    }),
    '*/cartridge/scripts/util/contentHeader': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/contentHeader', {}),
    '*/cartridge/scripts/util/urlencoded': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/urlencoded', {
      'dw/crypto/Encoding': mocks['dw/crypto/Encoding'],
    }),
    '*/cartridge/scripts/util/multipart': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/multipart', {
      'dw/util/Bytes': MockBytes,
      '*/cartridge/scripts/util/headers': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {}),
      '*/cartridge/scripts/util/ByteStream': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
        'dw/util/Bytes': MockBytes,
      }),
    }),
  }),
});

describe('scripts/webservice/RestAuthService', () => {
  let TestService;

  beforeEach(() => {
    TestService = RestAuthService.extend({
      SERVICE_CONFIGURATIONS: {
        default: 'http.default',
        auth: 'http.auth',
      },
      CACHE_KEY: 'testCacheKey',
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#getAuthentication()', () => {
    const setCache = (data) => {
      const cache = new MockCache({ testCacheKey: data });
      MockCacheMgr.store.authCredentials = cache;
      return cache;
    };

    it('should return stored auth credentials if not expired', () => {
      const authData = { type: 'Bearer', credentials: 'testToken' };
      const cacheData = { expiration: Date.now() + 10000, auth: authData };

      setCache(cacheData);

      const authentication = TestService.getAuthentication();

      expect(authentication).to.deep.equal(authData);
    });

    it('should fetch new auth credentials if expired', () => {
      const now = Date.now();
      const expiredCacheData = { expiration: now - 10000, auth: { type: 'Bearer', credentials: 'expiredToken' } };
      const newAuthData = { token_type: 'Bearer', access_token: 'newToken', expires_in: 3600 };
      const result = new MockResult(MockResult.OK, newAuthData);
      const cache = setCache(expiredCacheData);

      sinon.stub(TestService, 'sendAuthRequest').returns(result);
      sinon.stub(TestService, 'parseAuthResult').returns({
        expiration: newAuthData.expires_in * 1000,
        auth: {
          type: newAuthData.token_type,
          credentials: newAuthData.access_token,
        },
      });

      const authentication = TestService.getAuthentication();

      expect(TestService.sendAuthRequest.calledOnce).to.be.true;
      expect(authentication.type).to.equal(newAuthData.token_type);
      expect(authentication.credentials).to.equal(newAuthData.access_token);

      const cachedData = cache.get('testCacheKey');
      expect(cachedData.expiration).to.be.above(now);
      expect(cachedData.auth.type).to.equal(newAuthData.token_type);
      expect(cachedData.auth.credentials).to.equal(newAuthData.access_token);
    });

    it('should throw an error if authorization fails', () => {
      const result = new MockResult(MockResult.ERROR, { errorMessage: 'Authorization failed' });

      MockCacheMgr.store.authCredentials = new MockCache();
      sinon.stub(TestService, 'sendAuthRequest').returns(result);

      expect(() => TestService.getAuthentication()).to.throw('Authorization failed');
    });

    it('should handle missing cache gracefully', () => {
      MockCacheMgr.store.authCredentials = null;

      const newAuthData = { token_type: 'Bearer', access_token: 'newToken', expires_in: 3600 };
      const result = new MockResult(MockResult.OK, newAuthData);

      sinon.stub(TestService, 'sendAuthRequest').returns(result);
      sinon.stub(TestService, 'parseAuthResult').returns({
        expiration: newAuthData.expires_in * 1000,
        auth: {
          type: newAuthData.token_type,
          credentials: newAuthData.access_token,
        },
      });

      const authentication = TestService.getAuthentication();

      expect(TestService.sendAuthRequest.calledOnce).to.be.true;
      expect(authentication.type).to.equal(newAuthData.token_type);
      expect(authentication.credentials).to.equal(newAuthData.access_token);
    });
  });

  describe('#sendAuthRequest()', () => {
    it('should throw an error if not implemented', () => {
      expect(() => TestService.sendAuthRequest()).to.throw('sendAuthRequest method must be implemented by subclass');
    });
  });

  describe('#parseAuthResult()', () => {
    it('should throw an error if not implemented', () => {
      expect(() => TestService.parseAuthResult()).to.throw('parseAuthResult method must be implemented by subclass');
    });
  });
});
