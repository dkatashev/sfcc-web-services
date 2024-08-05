'use strict';

const chai = require('chai');
const expect = chai.expect;
const mocks = require('../../../mockPathMap');

const contentHeader = mocks['*/cartridge/scripts/util/contentHeader'];

describe('scripts/util/contentHeader', () => {
  describe('parse()', () => {
    it('should correctly parse Content-Type header', () => {
      const header = 'text/plain; charset=utf-8; format=flowed';
      const result = contentHeader.parse(header, 'type');

      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.equal('utf-8');
      expect(result.params.format).to.equal('flowed');
    });

    it('should correctly parse Content-Disposition header', () => {
      const header = 'attachment; filename="file.txt"';
      const result = contentHeader.parse(header, 'disposition');

      expect(result.type).to.equal('attachment');
      expect(result.params.filename).to.equal('file.txt');
    });

    it('should ignore parameters without a value', () => {
      const header = 'text/plain; charset';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.be.undefined;
    });

    it('should ignore incorrect Content-Type MIME', () => {
      const header = 'text';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('');
    });
  });

  describe('format()', () => {
    it('should format a content header from an object', () => {
      const headerString = contentHeader.format({
        type: 'text/plain',
        params: {
          charset: 'utf-8',
          format: 'flowed',
        },
      });

      expect(headerString).to.equal('text/plain; charset=utf-8; format=flowed');
    });

    it('should handle headers without parameters', () => {
      const headerString = contentHeader.format({
        type: 'image/jpeg',
        params: {},
      });

      expect(headerString).to.equal('image/jpeg');
    });
  });
});
