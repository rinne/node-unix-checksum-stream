'use strict';

const Optist = require('optist');
const ou = require('optist/util');

const UnixChecksumStream = require('./index.js');
//const UnixChecksumStream = require('unix-checksum-stream/');
const ph = require('./promise.js');
//const ph = require('unix-checksum-stream/promise');

var opt = ((new Optist())
		   .opts([ { shortName: 'a',
					 longName: 'algorithm',
					 description: 'Hash algorithm to use.',
					 required: true,
					 hasArg: true,
					 optArgCb: ou.allowListCbFactory(UnixChecksumStream.algorithms()) },
				   { shortName: 'e',
					 longName: 'digest-encoding',
					 hasArg: true,
					 optArgCb: ou.allowListCbFactory(UnixChecksumStream.encodings()) },
				   { shortName: 's',
					 longName: 'string',
					 hasArg: true,
					 multi: true },
				   { shortName: 'c',
					 longName: 'compact' },
				   { shortName: 'E',
					 longName: 'list-digest-encodings' },
				   { shortName: 'A',
					 longName: 'list-algorithms' } ])
		   .help('trdigest')
		   .parse());

(function(filenames) {
	var strings = opt.value('string');
	var errors = 0;
	var p = [];
	if (opt.value('list-digest-encodings') || opt.value('list-algorithms')) {
		if (opt.value('list-algorithms')) {
			console.log('algorithms: ' + UnixChecksumStream.algorithms().join(', '));
		}
		if (opt.value('list-digest-encodings')) {
			console.log('digest encodings: ' + UnixChecksumStream.encodings().join(', '));
		}
		process.exit(0);
	}
	function handlerFactory(name) {
		return function(ret) {
			if (ret instanceof Error) {
				if (opt.value('compact')) {
					ret = '?';
				} else {
					ret = ret.toString().replace(/\n/g, ' ').replace(/\s+/g, ' ');
				}
				errors++;
			}
			if (Buffer.isBuffer(ret)) {
				ret = ret.toString('hex');
			}
			if (opt.value('compact')) {
				console.log(ret);
			} else {
				console.log(name + ': ' + ret);
			}
		}
	};
	if ((strings.length == 0) && (filenames.length == 0)) {
		let handler = handlerFactory('<stdin>');
		p.push(ph.stream(process.stdin, opt.value('algorithm'), opt.value('digest-encoding'))
			   .then(handler)
			   .catch(handler));
	}
	strings.forEach(function(s) {
		let handler = handlerFactory('"' + s + '"');
		p.push(ph.data(s, opt.value('algorithm'), opt.value('digest-encoding'))
			   .then(handler)
			   .catch(handler));
	});
	filenames.forEach(function(f) {
		let handler = handlerFactory(f);
		p.push(ph.file(f, opt.value('algorithm'), opt.value('digest-encoding'))
			   .then(handler)
			   .catch(handler));
	});
	(Promise.all(p)
	 .then(function() {
		 process.exit((errors > 0) ? 1 : 0);
	 })
	 .catch(function(e) {
		 console.error('Unexpected error');
		 process.exit(1);
	 }))
})(opt.rest())
