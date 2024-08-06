'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const mocks = require('../../../mocks');
const MockBytes = mocks['dw/util/Bytes'];
const ByteStream = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
  'dw/util/Bytes': MockBytes,
});

describe('scripts/util/ByteStream', () => {
  let source;
  let stream;

  beforeEach(() => {
    source = new MockBytes('hello\r\nworld\r\n!');
    stream = new ByteStream(source);
  });

  describe('ByteStream.equal()', () => {
    it('should return true for equal byte arrays', () => {
      const bytesA = new MockBytes('hello');
      const bytesB = new MockBytes('hello');

      expect(ByteStream.equal(bytesA, bytesB)).to.be.true;
    });

    it('should return false for byte arrays of different lengths', () => {
      const bytesA = new MockBytes('hello');
      const bytesB = new MockBytes('hello world');

      expect(ByteStream.equal(bytesA, bytesB)).to.be.false;
    });

    it('should return false for byte arrays of the same length but different contents', () => {
      const bytesA = new MockBytes('hello');
      const bytesB = new MockBytes('holla');

      expect(ByteStream.equal(bytesA, bytesB)).to.be.false;
    });
  });

  describe('ByteStream()', () => {
    it('should throw TypeError if source is not an instance of Bytes', () => {
      expect(() => new ByteStream('invalid')).to.throw(TypeError);
    });
  });

  describe('#eos()', () => {
    it('should return true when at end of stream', () => {
      stream.position = source.length;
      expect(stream.eos()).to.be.true;
    });

    it('should return false when not at end of stream', () => {
      stream.position = 0;
      expect(stream.eos()).to.be.false;
    });
  });

  describe('#move()', () => {
    it('should move the position correctly within bounds', () => {
      stream.move(5);
      expect(stream.position).to.equal(5);
    });

    it('should throw TypeError when offset is not a number', () => {
      expect(() => stream.move(null)).to.throw(TypeError);
    });

    it('should throw RangeError when moving position out of bounds', () => {
      expect(() => stream.move(-1)).to.throw(RangeError);
      expect(() => stream.move(source.length + 1)).to.throw(RangeError);
    });
  });

  describe('#peek()', () => {
    it('should peek at the correct byte without changing position', () => {
      expect(stream.peek()).to.equal(source.byteAt(0));
      expect(stream.position).to.equal(0);
    });

    it('should throw when peeking out of bounds', () => {
      stream.position = source.length; // Move to end
      expect(() => stream.peek()).to.throw();
    });
  });

  describe('#slice()', () => {
    it('should slice the byte stream correctly', () => {
      const result = stream.slice(1, 3);

      expect(result).to.be.instanceof(MockBytes);
      expect(result.length).to.equal(2);
    });

    it('should handle negative indices correctly', () => {
      const result = stream.slice(-3, -1);

      expect(result.length).to.equal(2);
    });

    it('should handle end less than start correctly', () => {
      const result = stream.slice(-1, -3);

      expect(result.length).to.equal(0);
    });
  });

  describe('#readN()', () => {
    it('should read the specified number of bytes and move the position', () => {
      const result = stream.readN(5);

      expect(result).to.be.instanceof(MockBytes);
      expect(result.length).to.equal(5);
      expect(stream.position).to.equal(5);
    });

    it('should return null when trying to read at the end of the stream', () => {
      stream.move(source.length);
      expect(stream.readN(1)).to.be.null;
    });

    it('should throw TypeError when n is not a number', () => {
      expect(() => stream.readN(null)).to.throw(TypeError);
    });

    it('should throw TypeError when n less than 0', () => {
      expect(() => stream.readN(-10)).to.throw(TypeError);
    });
  });

  describe('#read()', () => {
    it('should read the next byte and advance the position', () => {
      const firstByte = stream.read();

      expect(firstByte).to.equal(source.byteAt(0));
      expect(stream.position).to.equal(1);
    });

    it('should return null if trying to read past the end of the stream', () => {
      stream.move(source.length);
      expect(stream.read()).to.be.null;
    });
  });

  describe('#readLine()', () => {
    it('should read a line terminated by LF', () => {
      const sourceLF = new MockBytes('hello\nworld\n!');
      const streamLF = new ByteStream(sourceLF);

      expect(streamLF.readLine().toString()).to.equal('hello');
      expect(streamLF.readLine().toString()).to.equal('world');
      expect(streamLF.readLine().toString()).to.equal('!');
    });

    it('should handle CR correctly', () => {
      const sourceCR = new MockBytes('hello\rworld\r!');
      const streamCR = new ByteStream(sourceCR);

      expect(streamCR.readLine().toString()).to.equal('hello');
      expect(streamCR.readLine().toString()).to.equal('world');
      expect(streamCR.readLine().toString()).to.equal('!');
    });

    it('should handle CRLF correctly', () => {
      const sourceCRLF = new MockBytes('hello\r\nworld\r\n!');
      const streamCRLF = new ByteStream(sourceCRLF);

      expect(streamCRLF.readLine().toString()).to.equal('hello');
      expect(streamCRLF.readLine().toString()).to.equal('world');
      expect(streamCRLF.readLine().toString()).to.equal('!');
    });

    it('should return null if the sequence is at the end of the stream', () => {
      const byteStream = new ByteStream(new MockBytes('hello'));

      byteStream.move(5);
      expect(byteStream.readLine()).to.be.null;
    });
  });

  describe('#readUntil()', () => {
    it('should read until the specified byte sequence', () => {
      const sequence = new MockBytes('world');
      const result = stream.readUntil(sequence);

      expect(result).to.be.instanceof(MockBytes);
      expect(result.toString()).to.equal('hello\r\n');
    });

    it('should handle cases where the sequence is not found', () => {
      const sequence = new MockBytes('not found');
      const result = stream.readUntil(sequence);

      expect(result).to.be.null;
    });

    it('should return null if the sequence is at the end of the stream', () => {
      const sequence = new MockBytes('world');
      const byteStream = new ByteStream(new MockBytes('world'));

      byteStream.move(5);
      expect(byteStream.readUntil(sequence)).to.be.null;
    });

    it('should throw TypeError when sequence is not instance of Bytes', () => {
      expect(() => stream.readUntil('string')).to.throw(TypeError);
    });
  });
});
