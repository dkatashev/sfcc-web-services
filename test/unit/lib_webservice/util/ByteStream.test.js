'use strict';

var chai = require('chai');
var expect = chai.expect;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var MockBytes = require('../../../mocks/dw/util/Bytes');
var ByteStream = proxyquire('../../../../cartridges/lib_webservice/cartridge/scripts/util/ByteStream', {
  'dw/util/Bytes': MockBytes,
});

describe('scripts/util/ByteStream', function () {
  var source;
  var stream;

  beforeEach(function () {
    source = new MockBytes('hello\r\nworld\r\n!');
    stream = new ByteStream(source);
  });

  describe('#constructor()', function () {
    it('should throw TypeError if source is not an instance of Bytes', function () {
      expect(function () { new ByteStream('invalid'); }).to.throw(TypeError);
    });
  });

  describe('static #equal()', function () {
    it('should return true for equal byte arrays', function () {
      var bytesA = new MockBytes('hello');
      var bytesB = new MockBytes('hello');
      expect(ByteStream.equal(bytesA, bytesB)).to.be.true;
    });

    it('should return false for byte arrays of different lengths', function () {
      var bytesA = new MockBytes('hello');
      var bytesB = new MockBytes('hello world');
      expect(ByteStream.equal(bytesA, bytesB)).to.be.false;
    });

    it('should return false for byte arrays of the same length but different contents', function () {
      var bytesA = new MockBytes('hello');
      var bytesB = new MockBytes('holla');
      expect(ByteStream.equal(bytesA, bytesB)).to.be.false;
    });
  });

  describe('#eos()', function () {
    it('should handle eos correctly', function () {
      stream.position = source.length;
      expect(stream.eos()).to.be.true;
      stream.position = 0;
      expect(stream.eos()).to.be.false;
    });
  });

  describe('#move()', function () {
    it('should move the position correctly within bounds', function () {
      stream.move(5);
      expect(stream.position).to.equal(5);
    });

    it('should throw TypeError when offset is not a number', function () {
      expect(function () { stream.move(null); }).to.throw(TypeError);
    });

    it('should throw RangeError when moving position out of bounds', function () {
      expect(function () { stream.move(-1); }).to.throw(RangeError);
      expect(function () { stream.move(source.length + 1); }).to.throw(RangeError);
    });
  });

  describe('#peek()', function () {
    it('should peek at the correct byte without changing position', function () {
      expect(stream.peek()).to.equal(source.byteAt(0));
      expect(stream.position).to.equal(0);
    });

    it('should throw when peeking out of bounds', function () {
      stream.position = source.length; // Move to end
      expect(function () { stream.peek(); }).to.throw();
    });
  });

  describe('#slice()', function () {
    it('should slice the byte stream correctly', function () {
      var result = stream.slice(1, 3);
      expect(result).to.be.instanceof(MockBytes);
      expect(result.length).to.equal(2);
    });

    it('should handle negative indices correctly', function () {
      var result = stream.slice(-3, -1);
      expect(result.length).to.equal(2);
    });

    it('should handle end less then start correctly', function () {
      var result = stream.slice(-1, -3);
      expect(result.length).to.equal(0);
    });
  });

  describe('#readN()', function () {
    it('should read the specified number of bytes and move the position', function () {
      var result = stream.readN(5);
      expect(result).to.be.instanceof(MockBytes);
      expect(result.length).to.equal(5);
      expect(stream.position).to.equal(5);
    });

    it('should return null when trying to read at the end of the stream', function () {
      stream.move(source.length);
      expect(stream.readN(1)).to.be.null;
    });

    it('should throw TypeError when n is not a number', function () {
      expect(function () { stream.readN(null); }).to.throw(TypeError);
    });

    it('should throw TypeError when n less then 0', function () {
      expect(function () { stream.readN(-10); }).to.throw(TypeError);
    });
  });

  describe('#read()', function () {
    it('should read the next byte and advance the position', function () {
      var firstByte = stream.read();
      expect(firstByte).to.equal(source.byteAt(0));
      expect(stream.position).to.equal(1);
    });

    it('should return null if trying to read past the end of the stream', function () {
      stream.move(source.length);
      expect(stream.read()).to.be.null;
    });
  });

  describe('#readLine()', function () {
    it('should read a line terminated by LF', function () {
      var sourceLF = new MockBytes('hello\nworld\n!');
      var streamLF = new ByteStream(sourceLF);
      expect(streamLF.readLine().toString()).to.equal('hello');
      expect(streamLF.readLine().toString()).to.equal('world');
      expect(streamLF.readLine().toString()).to.equal('!');
    });

    it('should handle CR correctly', function () {
      var sourceCR = new MockBytes('hello\rworld\r!');
      var streamCR = new ByteStream(sourceCR);
      expect(streamCR.readLine().toString()).to.equal('hello');
      expect(streamCR.readLine().toString()).to.equal('world');
      expect(streamCR.readLine().toString()).to.equal('!');
    });

    it('should handle CRLF correctly', function () {
      var sourceCRLF = new MockBytes('hello\r\nworld\r\n!');
      var streamCRLF = new ByteStream(sourceCRLF);
      expect(streamCRLF.readLine().toString()).to.equal('hello');
      expect(streamCRLF.readLine().toString()).to.equal('world');
      expect(streamCRLF.readLine().toString()).to.equal('!');
    });

    it('should return null if the sequence is at the end of the stream', function () {
      var byteStream = new ByteStream(new MockBytes('hello'));
      byteStream.move(5);
      expect(byteStream.readLine()).to.be.null;
    });
  });

  describe('#readUntil()', function () {
    it('should read until the specified byte sequence', function () {
      var sequence = new MockBytes('world');
      var result = stream.readUntil(sequence);
      expect(result).to.be.instanceof(MockBytes);
      expect(result.toString()).to.equal('hello\r\n');
    });

    it('should handle cases where the sequence is not found', function () {
      var sequence = new MockBytes('not found');
      var result = stream.readUntil(sequence);
      expect(result).to.be.null;
    });

    it('should return null if the sequence is at the end of the stream', function () {
      var sequence = new MockBytes('world');
      var byteStream = new ByteStream(new MockBytes('world'));
      byteStream.move(5);
      expect(byteStream.readUntil(sequence)).to.be.null;
    });

    it('should throw TypeError when sequence is not instance of Bytes', function () {
      expect(function () { stream.readUntil('string'); }).to.throw(TypeError);
    });
  });
});
