"use strict";

const crypto = require('crypto');
const uc = require('unix-checksum');
const Writable = require('readable-stream').Writable;

class UnixChecksumStream extends Writable {
	constructor(algorithm, writableStreamOptions) {
		super(writableStreamOptions);
		this.cs = uc.createHash(algorithm);
		this.algorithm = algorithm;
	}

	static algorithms() {
		return uc.getHashes();
	}
	
	static getHashes() {
		return uc.getHashes();
	}

	static encodings() {
		uc.getDigestEncodings();
	}

	static getDigestEncodings() {
		uc.getDigestEncodings();
	}

	_write(d, encoding, cb) {
		if (d) {
			if (typeof(d) === 'string') {
				d = Buffer.from(d, encoding);
			}
			this.cs.update(d);
		}
		cb(null, d);
	}

	_final(cb) {
		this.eof = true;
		var digest = this.cs.final();
		this.emit('digest', digest);
		cb(null);
	}

	result(digestEncodings) {
		if (! this.eof) {
			throw new Error('Unfinished stream');
		}
		if (! digestEncodings) {
			digestEncodings = [ ];
		} else if (typeof(digestEncodings) === 'string') {
			digestEncodings = [ digestEncodings ];
		} else if (! Array.isArray(digestEncodings)) {
			throw new Error('Invalid digest encodings');
		}
		var result = {
			algorithm: this.algorithm,
			digest: this.cs.digest(),
			digests: {},
			length: this.cs.length,
			block: null
		};
		if (typeof(this.cs.block) === 'number') {
			result.block = this.cs.block;
		} else {
			delete result.block;
		}
		if (digestEncodings.length > 0) {
			digestEncodings.forEach(function(enc) {
				result.digests[enc] = this.cs.digest(enc);
			}.bind(this));
		} else {
			delete result.digests;
		}
		return result;
	}

	digest(encoding) {
		if (! this.eof) {
			throw new Error('Unfinished stream');
		}
		return this.cs.digest(encoding);
	}
};

module.exports = UnixChecksumStream;
