'use strict';

var chai = require('chai');
var expect = chai.expect;

var contentHeader = require('../../../../cartridges/lib_webservice/cartridge/scripts/util/contentHeader');

describe('scripts/util/contentHeader', function () {
  describe('#parse()', function () {
    it('should correctly parse Content-Type header', function () {
      var header = 'text/plain; charset=utf-8; format=flowed';
      var result = contentHeader.parse(header, 'type');
      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.equal('utf-8');
      expect(result.params.format).to.equal('flowed');
    });

    it('should correctly parse Content-Disposition header', function () {
      var header = 'attachment; filename="file.txt"';
      var result = contentHeader.parse(header, 'disposition');
      expect(result.type).to.equal('attachment');
      expect(result.params.filename).to.equal('file.txt');
    });

    it('should ignore parameters without a value', function () {
      var header = 'text/plain; charset';
      var result = contentHeader.parse(header);
      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.be.undefined;
    });

    it('should ignore incorrect Content-Type MIME', function () {
      var header = 'text';
      var result = contentHeader.parse(header);
      expect(result.type).to.equal('');
    });
  });

  describe('#format()', function () {
    it('should format a content header from an object', function () {
      var contentHeaderObject = {
        type: 'text/plain',
        params: {
          charset: 'utf-8',
          format: 'flowed'
        }
      };
      var headerString = contentHeader.format(contentHeaderObject);
      expect(headerString).to.equal('text/plain; charset=utf-8; format=flowed');
    });

    it('should handle headers without parameters', function () {
      var contentHeaderObject = {
        type: 'image/jpeg',
        params: {}
      };
      var headerString = contentHeader.format(contentHeaderObject);
      expect(headerString).to.equal('image/jpeg');
    });
  });
});
