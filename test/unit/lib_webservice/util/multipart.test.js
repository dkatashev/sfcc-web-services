'use strict';

const chai = require('chai');
const expect = chai.expect;
const mocks = require('../../../mockPathMap');

const MockBytes = mocks['dw/util/Bytes'];
const multipart = mocks['*/cartridge/scripts/util/multipart'];

describe('scripts/util/multipart', () => {
  describe('parse()', () => {
    it('should parse multipart body into parts with headers and body', () => {
      const boundary = 'WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = new MockBytes(
        '--WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Type: text/plain\r\n\r\nhello world\r\n--WebKitFormBoundary7MA4YWxkTrZu0gW--',
      );
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(1);
      expect(parts[0].headers['content-type']).to.equal('text/plain');
      expect(parts[0].body.toString()).to.equal('hello world');
    });

    it('should handle multiple parts', () => {
      const boundary = 'boundary';
      const body = new MockBytes(
        '--boundary\r\nContent-Type: text/plain\r\n\r\nPart1\r\n--boundary\r\nContent-Type: text/html\r\n\r\nPart2\r\n--boundary--',
      );
      const parts = multipart.parse(boundary, body);

      expect(parts.length).to.equal(2);
      expect(parts[1].body.toString()).to.equal('Part2');
    });

    it('should throw TypeError if the delimiter is missing', () => {
      const boundary = 'boundary';
      const body = new MockBytes('No delimiter here');

      expect(() => multipart.parse(boundary, body)).to.throw(TypeError);
    });
  });

  describe('format()', () => {
    it('should create a multipart body from parts', () => {
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
  });
});
