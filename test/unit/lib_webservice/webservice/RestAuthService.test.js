'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mocks = require('../../../mockPathMap');

const MockResult = mocks['dw/svc/Result'];
const MockCache = mocks['dw/system/Cache'];
const MockCacheMgr = mocks['dw/system/CacheMgr'];
const RestAuthService = mocks['*/cartridge/scripts/webservice/RestAuthService'];

describe('scripts/webservice/RestAuthService', () => {
  describe('authorize()', () => {
    it('should perform authorization using the auth service action', () => {
      const TestService = RestAuthService.extend({
        fetch: sinon.stub().returns(new MockResult({ ok: true })),
      });

      const result = TestService.authorize();
      expect(TestService.fetch.calledOnce).to.be.true;
      expect(TestService.fetch.calledWith('auth', sinon.match({
        method: 'POST',
        dataType: 'form',
        data: { grant_type: 'client_credentials' }
      }))).to.be.true;
      expect(result.ok).to.be.true;
    });
  });

  describe('getAuthentication()', () => {
    const config = {
      CACHE_ID: 'testCacheId',
      CACHE_KEY: 'testCacheKey',
    };
    let TestService;
    let getCacheStub;

    beforeEach(() => {
      TestService = RestAuthService.extend({
        authorize: sinon.stub(),
        CACHE_ID: config.CACHE_ID,
        CACHE_KEY: config.CACHE_KEY,
      });

      getCacheStub = sinon.stub(MockCacheMgr, 'getCache');
    });

    afterEach(() => {
      getCacheStub.restore();
    });

    it('should return authentication from cache if available', () => {
      const authData = { type: 'Bearer', credentials: 'testToken' };
      const cache = new MockCache({ [config.CACHE_KEY]: authData });
      getCacheStub.returns(cache);
      const authentication = TestService.getAuthentication();

      expect(getCacheStub.calledOnce).to.be.true;
      expect(getCacheStub.calledWith(config.CACHE_ID)).to.be.true;
      expect(authentication).to.equal(authData);
    });

    it('should call authorize and store authentication in cache if not available', () => {
      const data = { token_type: 'Bearer', access_token: 'testToken' };
      const result = new MockResult();

      result.object = data;
      getCacheStub.returns(new MockCache());
      TestService.authorize.returns(result);

      const authentication = TestService.getAuthentication();

      expect(TestService.authorize.calledOnce).to.be.true;
      expect(authentication.type).to.equal(data.token_type);
      expect(authentication.credentials).to.equal(data.access_token);
    });

    it('should throw an error if authorization fails', () => {
      const result = MockResult.unitTest.ERROR;

      getCacheStub.returns(new MockCache());
      TestService.authorize.returns(result);

      expect(() => TestService.getAuthentication()).to.throw(result.errorMessage);
    });
  });
});
