'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const headers = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {});

describe('scripts/util/headers', () => {
  describe('#parse()', () => {
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

    it('should handle empty input', () => {
      const result = headers.parse('');

      expect(result).to.deep.equal({});
    });

    it('should handle headers with spaces around the colon', () => {
      const rawHeaders = 'Content-Type : text/html\r\n Content-Length:123';
      const result = headers.parse(rawHeaders);

      expect(result['content-type']).to.equal('text/html');
      expect(result['content-length']).to.equal('123');
    });

    it('should handle headers with multiple colons', () => {
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

    it('should handle an empty headers object', () => {
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
