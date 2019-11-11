"use strict";

const assert = require('assert');

const ReadableTestDataStream = require('readable-test-data-stream');

const tv = require('unix-checksum/test/testvectors.js');
const ht = require('./hashtests.js');
const UnixChecksumStream = require('../index.js');
const ph = require('../promise.js');

var tests = { running: 0,
			  completed: {} };

(function() {
	var algs = UnixChecksumStream.algorithms();
	tv.concat(ht).forEach(function(v) {
		Object.keys(v).filter((k) => (algs.indexOf(k) >= 0)).forEach(function (a) {
			var i = v.input;
			var c = v[a];
			var s = new UnixChecksumStream(a);
			var d = new ReadableTestDataStream(v.input);
			s.on('digest', function(digest) {
				if (typeof(c) === 'string') {
                    assert.equal(s.digest('hex'), c, 'Checksum error in ' + a);
				} else if (typeof(c) === 'number') {
                    assert.equal(s.digest('number'), c, 'Checksum error in ' + a);
				} else if (Buffer.isBuffer(c)) {
                    assert.ok(c.equals(s.digest('buffer')), 'Checksum error in ' + a);
				}
				tests.completed[a] = (tests.completed[a] ? tests.completed[a] + 1 : 1);
				tests.running--;
			});
			tests.running++;
			d.pipe(s);
			(Promise.resolve()
			 .then(function() {
				 var e;
				 if (typeof(c) === 'string') {
					 e = 'hex';
				 } else if (typeof(c) === 'number') {
					 e = 'number';
				 } else if (Buffer.isBuffer(c)) {
                     e = 'buffer';
				 }
				 tests.running++;
				 return ph.data(testChop(i), a, e);
			 })
			 .then(function(ret) {
				 if (Buffer.isBuffer(ret)) {
                     assert.ok(ret.equals(c), 'Checksum error in ' + a);
				 } else {
                     assert.equal(ret, c, 'Checksum error in ' + a);
				 }
				 tests.completed[a] = (tests.completed[a] ? tests.completed[a] + 1 : 1);
				 tests.running--;
			 })
			 .catch(function(e) {
				 console.error(e);
				 process.exit(1);
			 }));
		});
	});
})();

// Chop a string or buffer to array of chunks in arbitrary but still
// deterministic way.
function testChop(b) {
	var r = [];
	while (b.length > 0) {
		let l = Math.ceil(b.length / 2);
		r.push(b.slice(0, l));
		b = b.slice(l);
	}
	return r;
};

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
