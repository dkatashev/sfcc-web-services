'use strict';

const chai = require('chai');
const expect = chai.expect;
const mocks = require('../../../mockPathMap');

const headers = mocks['*/cartridge/scripts/util/headers'];

describe('scripts/util/headers', () => {
  describe('parse()', () => {
    it('should correctly parse raw headers', () => {
      const rawHeaders = 'Content-Type: text/html\r\nContent-Length: 123';
      const result = headers.parse(rawHeaders);

      expect(result['content-type']).to.equal('text/html');
      expect(result['content-length']).to.equal('123');
    });

    it('should handle different line endings', () => {
      const rawHeadersCRLF = 'Host: example.com\r\nConnection: keep-alive';
      const rawHeadersLF = 'Host: example.com\nConnection: keep-alive';

      expect(headers.parse(rawHeadersCRLF)).to.deep.equal(headers.parse(rawHeadersLF));
    });

    it('should ignore lines without a colon', () => {
      const rawHeaders = 'Content-Type: text/html\nInvalidHeader\nContent-Length: 123';
      const result = headers.parse(rawHeaders);

      expect(result).to.deep.equal({
        'content-type': 'text/html',
        'content-length': '123',
      });
      expect(result.invalidheader).to.be.undefined;
    });
  });

  describe('format()', () => {
    it('should format a headers object into a raw headers string', () => {
      const rawHeaders = headers.format({
        'content-type': 'text/html',
        'content-length': '123',
      });

      expect(rawHeaders).to.equal('content-type: text/html\r\ncontent-length: 123');
    });

    it('should handle an empty headers object', () => {
      const rawHeaders = headers.format({});

      expect(rawHeaders).to.equal('');
    });
  });
});
