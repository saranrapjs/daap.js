// Copyright 2010 Matthew Wood
//
// Licensed under the Apache License, Version 2.0

var sys = require('sys');
var ID3v2 = require('./id3v2').ID3v2;require('./id3v2frames');
var binary = require('./binary');
var fs = require('fs');
var binary = require('./binary');

var Song = exports.Song = function(options) {
  options = options || {};

  if (!options.file) {
    throw "Song constructor needs a file";
  }

  var song = this;

  var tags = {};

  var fd = fs.openSync(options.file, 'r');
  var reader = new BinaryFile(fd);

/*
  if (binary.unpackString(reader.getBytesAt(0, 3), 0, 3) == "ID3") {
    sys.log("[id3v2] scanning tags...");
    tags = ID3v2.readTagsFromData(reader);
  }
*/

  fs.stat(options.file, function(err, stats) {
    if (err) {
      throw "Failed to stat " + song.file;
    }
    
    song.size = stats.size;
  });

  this.file = options.file;

  this.artist = options.artist || tags.artist || options.file;
  this.name = options.name || tags.title || options.file;
  this.album = options.album || tags.album || options.file;

  this.extension = this.file.split('.').pop();
  this.format = 'mp3';
  this.formatDescription = 'mp3 audio file';
  if (this.extension == 'm4a') {
	  this.format = 'm4a';
	  this.formatDescription = 'm4a audio file';
  }

  var now = new Date();
  this.dateAdded = now;
  this.dateModified = now;

  this.time = options.time || 0;
};

exports.getAllFromDirectory = function(dir) {
  return [];
};

function BinaryFile(fd) {
  this.fd = fd;
}

BinaryFile.prototype.getStringAt = function(offset, length) {
  return binary.unpackString(this.getBytesAt(offset, length), 0, length);
}

BinaryFile.prototype.getLongAt = function(offset) {
  return binary.unpackInt(this.getBytesAt(offset, 4));
}

BinaryFile.prototype.getByteAt = function(offset) {
  return binary.unpackByte(this.getBytesAt(offset, 1));
}

BinaryFile.prototype.isBitSetAt = function(offset, bit) {
  var mask = 1 << bit;
  return this.getByteAt(offset) & mask == mask;
}

BinaryFile.prototype.getBytesAt = function(offset, length) {
  var buffer = new Buffer(length);
  var lastRead = fs.readSync(this.fd, buffer, 0, length, offset);
  return buffer;
}

BinaryFile.prototype.getStringWithCharsetAt = function(offset, length, charset) {
  var encoding;
  switch( charset.toLowerCase() ) {
    case 'utf-8':
      encoding = binary.characterEncoding.utf8;
      break;
    case 'utf-16':
      encoding = binary.characterEncoding.utf16;
      break;
    default:
      throw "Encoding '" + charset + "' not supported";
  }

  return binary.unpackString(this.getBytesAt(offset, length), 0, length, encoding);
}

