"use strict";

const assert = require('assert');

const tv = require('unix-checksum/test/testvectors.js');
const UnixChecksumStream = require('../index.js');
const Readable = require('readable-stream').Readable;

class TestConstStream extends Readable {
	constructor(data, encoding, readableStreamOptions) {
		super(readableStreamOptions);
		this.buf = Buffer.from(data, Buffer.isBuffer(data) ? undefined : encoding);
	}
	_read(size) {
		let len, buf;
		do {
			len = Math.ceil(this.buf.length / 2);
			if (Number.isSafeInteger(size) && (size > 0)) {
				len = Math.min(len, size);
			}
			buf = this.buf.slice(0, len);
			this.buf = this.buf.slice(len);
		} while ((len > 0) && this.push(buf));
		if (this.buf.length == 0) {
			this.push(null);
		}
	}
}

(function() {
	tv.forEach(function(v) {
		[ 'bsdsum', 'sysvsum', 'cksum', 'crc32', 'crc32c' ].forEach(function (a) {
			var i = v.input;
			var c = v[a];
			var s = new UnixChecksumStream(a);
			var d = new TestConstStream(v.input);
			s.on('digest', function(digest) {
				if (typeof(c) === 'number') {
                    assert.equal(c, digest, 'Checksum error in ' + a);
				}
			});
			d.pipe(s);
		});
	});
})();
