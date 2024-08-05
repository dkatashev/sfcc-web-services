'use strict';

const chai = require('chai');
const expect = chai.expect;
const mocks = require('../../../mockPathMap');

const urlencoded = mocks['*/cartridge/scripts/util/urlencoded'];

describe('scripts/util/urlencoded', () => {
  describe('parse()', () => {
    it('should parse a URL-encoded string into an object', () => {
      const result = urlencoded.parse('key1=value1&key2=value2');

      expect(result).to.deep.equal({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should decode URL-encoded keys and values', () => {
      const result = urlencoded.parse('key%201=value%201&key%202=value%202');

      expect(result).to.deep.equal({
        'key 1': 'value 1',
        'key 2': 'value 2',
      });
    });

    it('should handle empty strings', () => {
      const result = urlencoded.parse('');

      expect(result).to.deep.equal({});
    });
  });

  describe('format()', () => {
    it('should convert an object to a URL-encoded string', () => {
      const result = urlencoded.format({
        key1: 'value1',
        key2: 'value2',
      });

      expect(result).to.equal('key1=value1&key2=value2');
    });

    it('should encode keys and values', () => {
      const result = urlencoded.format({
        'key 1': 'value 1',
        'key 2': 'value 2',
      });

      expect(result).to.equal('key%201=value%201&key%202=value%202');
    });

    it('should handle empty objects', () => {
      const result = urlencoded.format({});

      expect(result).to.equal('');
    });
  });
});
