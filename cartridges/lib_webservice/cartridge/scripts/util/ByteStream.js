'use strict';

var Bytes = require('dw/util/Bytes');

/**
 * Represents a stream of bytes with various utility methods for reading and manipulating the stream.
 * @param {dw.util.Bytes} source - The source of bytes for the stream.
 * @constructor
 */
function ByteStream(source) {
  if (!(source instanceof Bytes)) {
    throw new TypeError('Source must be a dw.util.Bytes instance.');
  }

  this.source = source;
  this.length = this.source.length;
  this.position = 0;
}

/**
 * Character codes for common control characters.
 */
ByteStream.charCode = {
  CR: 13, // Carriage return '\r'
  LF: 10, // Line feed '\n'
  HN: 45, // Hyphen '-'
};

/**
 * Compares two byte arrays for equality.
 * @param {dw.util.Bytes} a - The first byte array.
 * @param {dw.util.Bytes} b - The second byte array.
 * @returns {boolean} - True if the byte arrays are equal, false otherwise.
 */
ByteStream.equal = function (a, b) {
  var length = a.length;

  if (length !== b.length) {
    return false;
  }

  // Compare byte-by-byte
  for (var i = 0; i < length; i++) {
    if (a.byteAt(i) !== b.byteAt(i)) {
      return false;
    }
  }

  return true;
};

/**
 * Adjusts the index based on the length of an array or string.
 * If the index is negative, it is adjusted by adding the length of the array or string to it.
 * @param {number} i - The index to adjust.
 * @param {number} l - The length of the array or string.
 * @returns {number} - The adjusted index.
 */
ByteStream.adjustIndex = function (i, l) {
  return i < 0 ? (l + i) : i;
};

/**
 * Checks if the end of the stream has been reached.
 * @returns {boolean} - True if the end of the stream has been reached, false otherwise.
 */
ByteStream.prototype.eos = function () {
  return this.position >= this.length;
};

/**
 * Moves the position within the stream by a specified offset.
 * @param {number} offset - The number of bytes to move the position by.
 * @throws {TypeError} - Throws an error if offset is not a number.
 */
ByteStream.prototype.move = function (offset) {
  if (typeof offset !== 'number') {
    throw new TypeError('Offset must be a number.');
  }

  var newPosition = this.position + offset;

  if (newPosition < 0 || newPosition > this.length) {
    throw new RangeError('Target index is out of bounds.');
  }

  this.position = newPosition;
};

/**
 * Peeks at a byte in the stream at the current position plus an optional offset without advancing the position.
 * @param {number} [offset=0] - The offset from the current position to peek at.
 * @returns {number} - The byte at the specified position or throws an error if out of bounds.
 * @throws {TypeError} - Throws an error if the offset is out of bounds.
 */
ByteStream.prototype.peek = function (offset) {
  var positionOffset = offset || 0;
  var index = this.position + positionOffset;

  return this.source.byteAt(index);
};

/**
 * Slices a portion of the stream into a new byte array.
 * @param {number} [start=0] - The starting position of the slice. Defaults to 0.
 * @param {number} [end=this.length] - The ending position of the slice. Defaults to the end of the stream.
 * @returns {dw.util.Bytes} - The sliced bytes.
 */
ByteStream.prototype.slice = function (start, end) {
  var length = this.length;

  // If start or end is negative, adjust it based on the length
  var from = ByteStream.adjustIndex(start, length);
  var to = ByteStream.adjustIndex(end, length);

  // Ensure start and end are within the bounds
  from = Math.max(0, from);
  to = Math.min(length, to);

  // If the end is before the start after adjustment, return empty Bytes
  if (to < from) {
    return this.source.bytesAt(0, 0);
  }

  // Calculate length
  var sliceLength = to - from;

  // Create the slice from the adjusted indices
  return this.source.bytesAt(from, sliceLength);
};

/**
 * Reads a specified number of bytes from the stream.
 * @param {number} n - The number of bytes to read.
 * @returns {dw.util.Bytes|null} - The read bytes, or null if the end of the stream has been reached.
 * @throws {TypeError} - Throws an error if n is not a non-negative number.
 */
ByteStream.prototype.readN = function (n) {
  if (typeof n !== 'number' || n < 0) {
    throw new TypeError('Number of bytes to read must be a non-negative number.');
  }

  if (this.eos()) {
    return null;
  }

  var bytesToRead = Math.min(n, this.length - this.position);
  var bytes = this.source.bytesAt(this.position, bytesToRead);

  this.move(bytesToRead);

  return bytes;
};

/**
 * Reads a single byte from the stream and advances the position.
 * @returns {number|null} - The read byte, or null if the end of the stream has been reached.
 */
ByteStream.prototype.read = function () {
  if (this.eos()) {
    return null;
  }

  // Peek the current byte
  var byte = this.peek();

  this.move(1);

  return byte;
};

/**
 * Reads a line from the stream, ending at a newline character.
 * @returns {dw.util.Bytes|null} - The read line, or null if the end of the stream has been reached.
 */
ByteStream.prototype.readLine = function () {
  if (this.eos()) {
    return null;
  }

  var CR = ByteStream.charCode.CR;
  var LF = ByteStream.charCode.LF;
  var start = this.position;
  var char;

  while (!this.eos()) {
    // Read the byte
    char = this.read();

    // Handle LF
    if (char === LF) {
      return this.slice(start, this.position - 1);
    }

    // Handle CR
    if (char === CR) {
      // Check for CRLF
      if (this.peek() === LF) {
        // Skip the LF
        this.move(1);
        return this.slice(start, this.position - 2);
      }

      // Handle CR alone
      return this.slice(start, this.position - 1);
    }
  }

  // If the stream ends without a newline, return the remaining part
  return this.slice(start, this.position);
};

/**
 * Reads bytes from the stream until a specified sequence is encountered.
 * @param {dw.util.Bytes} sequence - The sequence of bytes to read until.
 * @returns {dw.util.Bytes|null} - The read bytes, or null if the end of the stream has been reached.
 * @throws {TypeError} - Throws an error if sequence is not an instance of dw.util.Bytes.
 */
ByteStream.prototype.readUntil = function (sequence) {
  if (!(sequence instanceof Bytes)) {
    throw new TypeError('Sequence must be a dw.util.Bytes instance.');
  }

  if (this.eos()) {
    return null;
  }

  var start = this.position;
  var sequenceLength = sequence.length;
  var streamLength = this.length;
  var endPosition = streamLength - sequenceLength;
  var chunk;
  var result;

  // Read bytes until the sequence is found or end of the stream is reached
  while (this.position <= endPosition) {
    chunk = this.source.bytesAt(this.position, sequenceLength);

    if (ByteStream.equal(sequence, chunk)) {
      result = this.slice(start, this.position);
      this.move(sequenceLength);
      return result;
    }

    // Move position by 1 byte and continue searching
    this.move(1);
  }

  // Handle case when sequence is not found but the stream ends
  this.move(streamLength - this.position);
  return null;
};

module.exports = ByteStream;
