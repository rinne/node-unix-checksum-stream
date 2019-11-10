"use strict";

const uc = require('unix-checksum');
const Writable = require('readable-stream').Writable;

class UnixChecksumStream extends Writable {
	constructor(algorithm, writableStreamOptions) {
		super(writableStreamOptions);
		switch (algorithm) {
		case 'bsdsum':
			this.cs = new uc.BsdSum();
			break;
		case 'sysvsum':
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
			throw new Error('Unsupported checksum algorithm');
		};
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
	
	digest(encoding) {
		if (! this.eof) {
			throw new Error('Unfinished stream');
		}
		return this.cs.digest(encoding);
	}
};

module.exports = UnixChecksumStream;
