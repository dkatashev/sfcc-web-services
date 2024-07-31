'use strict';

var chai = require('chai');
var expect = chai.expect;

var headers = require('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers');

describe('scripts/util/headers', function () {
  describe('#parse()', function () {
    it('should correctly parse raw headers', function () {
      var rawHeaders = 'Content-Type: text/html\r\nContent-Length: 123';
      var result = headers.parse(rawHeaders);
      expect(result['content-type']).to.equal('text/html');
      expect(result['content-length']).to.equal('123');
    });

    it('should handle different line endings', function () {
      var rawHeadersCRLF = 'Host: example.com\r\nConnection: keep-alive';
      var rawHeadersLF = 'Host: example.com\nConnection: keep-alive';
      expect(headers.parse(rawHeadersCRLF)).to.deep.equal(headers.parse(rawHeadersLF));
    });

    it('should ignore lines without a colon', function () {
      var rawHeaders = 'Content-Type: text/html\nInvalidHeader\nContent-Length: 123';
      var result = headers.parse(rawHeaders);
      expect(result).to.deep.equal({
        'content-type': 'text/html',
        'content-length': '123'
      });
      expect(result.invalidheader).to.be.undefined;
    });
  });

  describe('#format()', function () {
    it('should format a headers object into a raw headers string', function () {
      var headerObject = {
        'content-type': 'text/html',
        'content-length': '123'
      };
      var rawHeaders = headers.format(headerObject);
      expect(rawHeaders).to.equal('content-type: text/html\r\ncontent-length: 123');
    });

    it('should handle an empty headers object', function () {
      var headerObject = {};
      var rawHeaders = headers.format(headerObject);
      expect(rawHeaders).to.equal('');
    });
  });
});
