'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockBytes = mocks['dw/util/Bytes'];
const headers = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/headers', {});
const ByteStream = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
  'dw/util/Bytes': MockBytes,
});
const multipart = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/multipart', {
  'dw/util/Bytes': MockBytes,
  '*/cartridge/scripts/util/headers': headers,
  '*/cartridge/scripts/util/ByteStream': ByteStream,
});

describe('scripts/util/multipart', () => {
  describe('#parse()', () => {
    it('should parse a single part with headers and body', () => {
      const boundary = 'WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = new MockBytes('--WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Type: text/plain\r\n\r\nhello world\r\n--WebKitFormBoundary7MA4YWxkTrZu0gW--');
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(1);
      expect(parts[0].headers['content-type']).to.equal('text/plain');
      expect(parts[0].body.toString()).to.equal('hello world');
    });

    it('should parse multiple parts with different headers and bodies', () => {
      const boundary = 'boundary';
      const body = new MockBytes('--boundary\r\nContent-Type: text/plain\r\n\r\nPart1\r\n--boundary\r\nContent-Type: text/html\r\n\r\nPart2\r\n--boundary--');
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(2);
      expect(parts[0].body.toString()).to.equal('Part1');
      expect(parts[1].body.toString()).to.equal('Part2');
    });

    it('should throw TypeError if the delimiter is missing', () => {
      const boundary = 'boundary';
      const body = new MockBytes('No delimiter here');

      expect(() => multipart.parse(boundary, body)).to.throw(TypeError);
    });

    it('should handle an empty body', () => {
      const boundary = 'boundary';
      const body = new MockBytes('');

      const parts = multipart.parse(boundary, body);
      expect(parts.length).to.equal(0);
    });

    it('should handle parts without headers', () => {
      const boundary = 'boundary';
      const body = new MockBytes('--boundary\r\n\r\n\r\nPart1\r\n--boundary--');
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(1);
      expect(parts[0].headers).to.deep.equal({});
      expect(parts[0].body.toString()).to.equal('Part1');
    });

    it('should handle broken parts and return a null body', () => {
      const boundary = 'boundary';
      const body = new MockBytes('--boundary\r\n\r\nPart1\r\n--boundary--');
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(1);
      expect(parts[0].headers).to.deep.equal({});
      expect(parts[0].body).to.be.null;
    });
  });

  describe('#format()', () => {
    it('should create a multipart body from parts with headers and body', () => {
      const boundary = 'boundary';
      const parts = [
        {
          headers: { 'content-type': 'text/plain' },
          body: new MockBytes('Part1'),
        },
        {
          headers: { 'content-type': 'text/html' },
          body: new MockBytes('Part2'),
        },
      ];
      const multipartBody = multipart.format(boundary, parts);

      expect(multipartBody).to.include('Part1');
      expect(multipartBody).to.include('Part2');
      expect(multipartBody).to.include('--boundary');
    });

    it('should create a multipart body from an empty parts array', () => {
      const boundary = 'boundary';
      const parts = [];
      const multipartBody = multipart.format(boundary, parts);

      expect(multipartBody).to.equal('--boundary--');
    });

    it('should create a multipart body from parts without headers', () => {
      const boundary = 'boundary';
      const parts = [
        {
          headers: {},
          body: new MockBytes('Part1'),
        },
      ];
      const multipartBody = multipart.format(boundary, parts);

      expect(multipartBody).to.include('Part1');
      expect(multipartBody).to.include('--boundary');
    });
  });
});
