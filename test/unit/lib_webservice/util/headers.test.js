'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const headers = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {});

describe('scripts/util/headers', () => {
  describe('#parse()', () => {
    it('should correctly parse raw headers into an object', () => {
      const rawHeaders = 'Content-Type: text/html\r\nContent-Length: 123';
      const result = headers.parse(rawHeaders);

      expect(result['content-type']).to.equal('text/html');
      expect(result['content-length']).to.equal('123');
    });

    it('should handle different line endings (CRLF and LF)', () => {
      const rawHeadersCRLF = 'Host: example.com\r\nConnection: keep-alive';
      const rawHeadersLF = 'Host: example.com\nConnection: keep-alive';

      expect(headers.parse(rawHeadersCRLF)).to.deep.equal(headers.parse(rawHeadersLF));
    });

    it('should ignore lines without a colon and exclude invalid headers', () => {
      const rawHeaders = 'Content-Type: text/html\nInvalidHeader\nContent-Length: 123';
      const result = headers.parse(rawHeaders);

      expect(result).to.deep.equal({
        'content-type': 'text/html',
        'content-length': '123',
      });
      expect(result.invalidheader).to.be.undefined;
    });

    it('should return an empty object for empty input', () => {
      const result = headers.parse('');

      expect(result).to.deep.equal({});
    });

    it('should handle headers with spaces around the colon correctly', () => {
      const rawHeaders = 'Content-Type : text/html\r\n Content-Length:123';
      const result = headers.parse(rawHeaders);

      expect(result['content-type']).to.equal('text/html');
      expect(result['content-length']).to.equal('123');
    });

    it('should handle headers with multiple colons correctly, treating everything after the first colon as the value', () => {
      const rawHeaders = 'X-Custom-Header: value:with:colons';
      const result = headers.parse(rawHeaders);

      expect(result['x-custom-header']).to.equal('value:with:colons');
    });
  });

  describe('#format()', () => {
    it('should format a headers object into a raw headers string', () => {
      const rawHeaders = headers.format({
        'content-type': 'text/html',
        'content-length': '123',
      });

      expect(rawHeaders).to.equal('content-type: text/html\r\ncontent-length: 123');
    });

    it('should handle an empty headers object and return an empty string', () => {
      const rawHeaders = headers.format({});

      expect(rawHeaders).to.equal('');
    });

    it('should format headers with multiple colons correctly', () => {
      const rawHeaders = headers.format({
        'x-custom-header': 'value:with:colons',
      });

      expect(rawHeaders).to.equal('x-custom-header: value:with:colons');
    });
  });
});
