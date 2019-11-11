"use strict";

const fs = require('fs');

const UnixChecksumStream = require('./index.js');

function file(filename, algorithm, digestEncoding) {
	return (stream(fs.createReadStream(filename), algorithm, digestEncoding));
}

function traverse(data, callback) {
	if (Array.isArray(data)) {
		return data.forEach(function(data) { traverse(data, callback); });
	}
	if ((typeof(data) === 'string') || Buffer.isBuffer(data)) {
		return  callback(data);
	}
	if ((typeof(data) === 'number') || (typeof(data) === 'boolean')) {
		return callback(data.toString());
	}
	if (data === null) {
		return callback('null');
	}
	if (data === undefined) {
		return callback('undefined');
	}
	throw new Error('Type error in data traversal');
}

function data(data, algorithm, digestEncoding) {
	return new Promise(function(resolve, reject) {
		var completed = false;
		var h = new UnixChecksumStream(algorithm);
		var error = function(e) {
			if (completed) {
				return;
			}
			completed = true;
			reject(e);
		};
		var digest = function(digest) {
			if (completed) {
				return;
			}
			completed = true;
			resolve(digestEncoding ? h.digest(digestEncoding) : digest);
		};
		var cb = function(d) {
			h.write(d);
		};
		try {
			traverse(data, cb);
			h.end();
		} catch(e) {
			error(e);
			try {
				h.end();
			} catch(e) {
			}
		}
		h.on('error', error);
		h.on('digest', digest);
	});
}

function stream(stream, algorithm, digestEncoding) {
	return new Promise(function(resolve, reject) {
		var completed = false;
		var h = new UnixChecksumStream(algorithm);
		var error = function(e) {
			if (completed) {
				return;
			}
			completed = true;
			reject(e);
		};
		var digest = function(digest) {
			if (completed) {
				return;
			}
			completed = true;
			resolve(digestEncoding ? h.digest(digestEncoding) : digest);
		};
		stream.on('error', error);
		h.on('error', error);
		h.on('digest', digest);
		stream.pipe(h);
	});
}

module.exports = {
	file: file,
	data: data,
	stream: stream
};
