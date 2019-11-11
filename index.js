"use strict";

const crypto = require('crypto');
const uc = require('unix-checksum');
const Writable = require('readable-stream').Writable;

const Hash = require('./hash.js');

class UnixChecksumStream extends Writable {
	constructor(algorithm, writableStreamOptions) {
		super(writableStreamOptions);
		switch (algorithm) {
		case 'bsdsum':
		case 'sum-bsd':
			this.cs = new uc.BsdSum();
			break;
		case 'sysvsum':
		case 'sum-sysv':
			this.cs = new uc.SysvSum();
			break;
		case 'cksum':
			this.cs = new uc.CkSum();
			break;
		case 'crc32':
			this.cs = new uc.CRC32();
			break;
		case 'crc32c':
			this.cs = new uc.CRC32C();
			break;
		default:
			this.cs = new Hash(algorithm);
		};
		this.algorithm = algorithm;
	}

	static algorithms() {
		return (['bsdsum', 'sysvsum', 'cksum', 'crc32', 'crc32c', 'sum-bsd', 'sum-sysv' ]).concat(crypto.getHashes());
	}

	static encodings() {
		return [ 'hex', 'base64', 'number' ];
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
