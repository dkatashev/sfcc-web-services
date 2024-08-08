'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const contentHeader = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/contentHeader', {});

describe('scripts/util/contentHeader', () => {
  describe('#parse()', () => {
    it('should correctly parse Content-Type header with multiple parameters', () => {
      const header = 'text/plain; charset=utf-8; format=flowed';
      const result = contentHeader.parse(header, 'type');

      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.equal('utf-8');
      expect(result.params.format).to.equal('flowed');
    });

    it('should correctly parse Content-Disposition header with filename parameter', () => {
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

    it('should handle incorrect Content-Type MIME gracefully', () => {
      const header = 'text';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('');
    });

    it('should return empty type and params for empty input', () => {
      const header = '';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('');
      expect(result.params).to.deep.equal({});
    });

    it('should handle multiple parameters correctly', () => {
      const header = 'text/plain; charset=utf-8; boundary=something';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('text/plain');
      expect(result.params.charset).to.equal('utf-8');
      expect(result.params.boundary).to.equal('something');
    });

    it('should handle parameters with quoted values', () => {
      const header = 'text/plain; filename="file name.txt"';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('text/plain');
      expect(result.params.filename).to.equal('file name.txt');
    });

    it('should handle parameters with escaped quotes correctly', () => {
      const header = 'text/plain; filename="file \\"name\\".txt"';
      const result = contentHeader.parse(header);

      expect(result.type).to.equal('text/plain');
      expect(result.params.filename).to.equal('file "name".txt');
    });
  });

  describe('#format()', () => {
    it('should format a content header from an object with multiple parameters', () => {
      const headerString = contentHeader.format({
        type: 'text/plain',
        params: {
          charset: 'utf-8',
          format: 'flowed',
        },
      });

      expect(headerString).to.equal('text/plain; charset=utf-8; format=flowed');
    });

    it('should handle headers without parameters correctly', () => {
      const headerString = contentHeader.format({
        type: 'image/jpeg',
        params: {},
      });

      expect(headerString).to.equal('image/jpeg');
    });

    it('should format headers with multiple parameters correctly', () => {
      const headerString = contentHeader.format({
        type: 'multipart/form-data',
        params: {
          boundary: 'boundary',
          charset: 'utf-8'
        },
      });

      expect(headerString).to.equal('multipart/form-data; boundary=boundary; charset=utf-8');
    });

    it('should return an empty string if type and params are not provided', () => {
      const headerString = contentHeader.format({});

      expect(headerString).to.equal('');
    });

    it('should return only type if params is null', () => {
      const headerString = contentHeader.format({
        type: 'application/json',
        params: null,
      });

      expect(headerString).to.equal('application/json');
    });

    it('should return only type if params is undefined', () => {
      const headerString = contentHeader.format({
        type: 'application/json',
      });

      expect(headerString).to.equal('application/json');
    });

    it('should handle parameters with special characters correctly', () => {
      const headerString = contentHeader.format({
        type: 'text/plain',
        params: {
          filename: 'file "name".txt',
        },
      });

      expect(headerString).to.equal('text/plain; filename="file \\"name\\".txt"');
    });
  });
});
