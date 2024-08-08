'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockEncoding = mocks['dw/crypto/Encoding'];
const urlencoded = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/urlencoded', {
  'dw/crypto/Encoding': MockEncoding,
});

describe('scripts/util/urlencoded', () => {
  describe('#parse()', () => {
    it('should parse a URL-encoded string into an object with key-value pairs', () => {
      const result = urlencoded.parse('key1=value1&key2=value2');

      expect(result).to.deep.equal({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should decode URL-encoded keys and values correctly', () => {
      const result = urlencoded.parse('key%201=value%201&key%202=value%202');

      expect(result).to.deep.equal({
        'key 1': 'value 1',
        'key 2': 'value 2',
      });
    });

    it('should return an empty object for empty input string', () => {
      const result = urlencoded.parse('');

      expect(result).to.deep.equal({});
    });

    it('should parse strings without "=" as keys with empty values', () => {
      const result = urlencoded.parse('key1&key2');

      expect(result).to.deep.equal({
        key1: '',
        key2: '',
      });
    });

    it('should parse strings with empty values correctly', () => {
      const result = urlencoded.parse('key1=&key2=');

      expect(result).to.deep.equal({
        key1: '',
        key2: '',
      });
    });
  });

  describe('#format()', () => {
    it('should convert an object to a URL-encoded string with key-value pairs', () => {
      const result = urlencoded.format({
        key1: 'value1',
        key2: 'value2',
      });

      expect(result).to.equal('key1=value1&key2=value2');
    });

    it('should encode keys and values correctly', () => {
      const result = urlencoded.format({
        'key 1': 'value-1',
        'key 2': 'value(2)',
      });

      expect(result).to.equal('key+1=value-1&key+2=value%282%29');
    });

    it('should return an empty string for an empty object', () => {
      const result = urlencoded.format({});

      expect(result).to.equal('');
    });

    it('should handle objects with empty values correctly', () => {
      const result = urlencoded.format({
        key1: '',
        key2: '',
      });

      expect(result).to.equal('key1=&key2=');
    });

    it('should handle objects with special characters in keys and values', () => {
      const result = urlencoded.format({
        'key@1': 'value$1',
        'key/2': 'value+2',
      });

      expect(result).to.equal('key%401=value%241&key%2F2=value%2B2');
    });
  });
});
