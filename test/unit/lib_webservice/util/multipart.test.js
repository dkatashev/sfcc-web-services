'use strict';

var chai = require('chai');
var expect = chai.expect;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var MockBytes = require('../../../mocks/dw/util/Bytes');
var multipart = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/multipart', {
  'dw/util/Bytes': MockBytes,
  '*/cartridge/scripts/util/ByteStream': proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
    'dw/util/Bytes': MockBytes,
  }),
  '*/cartridge/scripts/util/headers': require('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers'),
});

describe('scripts/util/multipart', function () {
  describe('#parse()', function () {
    it('should parse multipart body into parts with headers and body', function () {
      var boundary = 'WebKitFormBoundary7MA4YWxkTrZu0gW';
      var body = new MockBytes('--WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Type: text/plain\r\n\r\nhello world\r\n--WebKitFormBoundary7MA4YWxkTrZu0gW--');
      var parts = multipart.parse(boundary, body);
      expect(parts.length).to.equal(1);
      expect(parts[0].headers['content-type']).to.equal('text/plain');
      expect(parts[0].body.toString()).to.equal('hello world');
    });

    it('should handle multiple parts', function () {
      var boundary = 'boundary';
      var body = new MockBytes('--boundary\r\nContent-Type: text/plain\r\n\r\nPart1\r\n--boundary\r\nContent-Type: text/html\r\n\r\nPart2\r\n--boundary--');
      var parts = multipart.parse(boundary, body);
      expect(parts.length).to.equal(2);
      expect(parts[1].body.toString()).to.equal('Part2');
    });

    it('should throw TypeError if the delimiter is missing', function () {
      var boundary = 'boundary';
      var body = new MockBytes('No delimiter here');
      expect(function () { multipart.parse(boundary, body); }).to.throw(TypeError);
    });
  });

  describe('#format()', function () {
    it('should create a multipart body from parts', function () {
      var boundary = 'boundary';
      var parts = [{
        headers: { 'content-type': 'text/plain' },
        body: new MockBytes('Part1')
      }, {
        headers: { 'content-type': 'text/html' },
        body: new MockBytes('Part2')
      }];
      var multipartBody = multipart.format(boundary, parts);
      expect(multipartBody).to.include('Part1');
      expect(multipartBody).to.include('Part2');
      expect(multipartBody).to.include('--boundary');
    });
  });
});
