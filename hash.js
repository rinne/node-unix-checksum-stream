'use strict';

const crypto = require('crypto');

var Hash = function(hash) {
	this.length = 0;
	this.result = null;
	this.state = 0;
	this.finalized = false;
	this.hash = crypto.createHash(hash);
};

Hash.prototype.update = function(b) {
	if (this.finalized) {
		throw new Error('Hash context in finalized state');
	}
	this.hash.update(b);
	this.length += b.length;
	return this;
};

Hash.prototype.digest = function(encoding) {
	if (! this.finalized) {
		this.result = this.hash.digest();
		this.finalized = true;
	}
	this.state = this.result[0] / 255;
	for (let i = 0; i < this.result.length; i++) {
		this.state = ((this.state * 255) + (this.result[i] / 255)) / 256;
	}
	if (! encoding) {
		encoding = 'buffer';
	}
	switch (encoding) {
	case 'buffer':
		return Buffer.from(this.result);
	case 'number':
		return this.state;
	default:
		return this.result.toString(encoding);
	};
	/*NOTREACHED*/
};

Hash.prototype.final = function(encoding) {
	if (this.finalized) {
		throw new Error('hash context already finalized');
	}
	return this.digest(encoding);
};

module.exports = Hash;
