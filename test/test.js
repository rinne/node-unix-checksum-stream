"use strict";

const assert = require('assert');

const ReadableTestDataStream = require('readable-test-data-stream');

const tv = require('unix-checksum/test/testvectors.js');
const ht = require('./hashtests.js');
const UnixChecksumStream = require('../index.js');

var tests = { running: 0,
			  completed: {} };
(function() {
	tv.forEach(function(v) {
		[ 'bsdsum', 'sysvsum', 'cksum', 'crc32', 'crc32c' ].forEach(function (a) {
			var i = v.input;
			var c = v[a];
			var s = new UnixChecksumStream(a);
			var d = new ReadableTestDataStream(v.input);
			s.on('digest', function(digest) {
				if (typeof(c) === 'number') {
                    assert.equal(c, digest, 'Checksum error in ' + a);
					tests.completed[a] = (tests.completed[a] ? tests.completed[a] + 1 : 1);
				}
				tests.running--;
			});
			tests.running++;
			d.pipe(s);
		});
	});
	ht.forEach(function(v) {
		[ 'md5', 'sha1', 'sha256', 'sha512' ].forEach(function (a) {
			var i = v.input;
			var c = v[a];
			var s = new UnixChecksumStream(a);
			var d = new ReadableTestDataStream(v.input);
			s.on('digest', function(digest) {
				digest = s.digest('hex');
				if (typeof(c) === 'string') {
                    assert.equal(c, digest, 'Checksum error in ' + a);
					tests.completed[a] = (tests.completed[a] ? tests.completed[a] + 1 : 1);
				}
				tests.running--;
			});
			tests.running++;
			d.pipe(s);
		});
	});
})();


var first = true;
function ready() {
	if (tests.running > 0) {
		if (first) {
			first = false;
		} else {
			console.log('Still running ' + tests.running.toString() + ' tests.');
		}
		setTimeout(ready, 1);
		return;
	}
	console.log(tests.completed);
}
ready();
