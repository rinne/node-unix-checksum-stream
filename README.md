In a Nutshell
=============

Stream wrapper around unix-checksum module implementing sum(1) (BSD
and SysV variants), cksum(1), CRC32 and CRC32C algorithms. Unlike the
parent module unix-checksum, this module can also make a streamable
version of all hash algorithms provided by crypto module (e.g. MD5,
SHA-1, SHA-256, SHA-512 and others).

Also a promise based interface is offered for all algorithms
mentioned.


Reference
=========

```
'use strict';

const fs = require('fs');
const UnixChecksumStream = require('unix-checksum-stream');

(function() {
    var f = fs.createReadStream('GPL-2.0.TXT');
    // Supported algorithms: bsdsum, sysvsum, cksum, crc32, crc32c
    // and anything in require('crypto').getHashes()
    var s = new UnixChecksumStream('bsdsum');
    s.on('digest', function(digest) {
        console.log(digest);
        console.log(s.digest());
        console.log(s.digest('hex'));
        console.log(s.digest('base64'));
    });
    f.pipe(s);
})();
```

UnixChecksumStream is a writable stream. Once the stream ends, it
emits 'digest' event including the checksum as a parameter. For
checksum algirithms the digest has a numerical value and for hash
algorithms it is a buffer.  Other encodings can be retrieved using
digest() method on the object after 'digest' (or 'finish') event has
been received. Unlike crypto module hashes, this module allows
multiple calls to digest() method.


Promise API
===========

file(filename, algorighm, digestEncoding)
-----------------------------------------

Returns a promise resolving with the checksum value calculated over
the file contents.

```
'use strict';

const ph = require('unix-checksum-stream/promise');

(ph.file('GPL-2.0.TXT', 'sha1', 'hex')
 .then(function(ret) {
	 console.log(ret);
	 process.exit(0);
 })
 .catch(function(e) {
	 console.log(e);
	 process.exit(1);
 }));
```

stream(filename, algorighm, digestEncoding)
-------------------------------------------

Returns a promise resolving with the checksum value calculated over
the data read from the stream.

```
'use strict';

const ph = require('unix-checksum-stream/promise');

(ph.stream(process.stdin, 'cksum')
 .then(function(ret) {
	 console.log(ret);
	 process.exit(0);
 })
 .catch(function(e) {
	 console.log(e);
	 process.exit(1);
 }));
```

data(filename, algorighm, digestEncoding)
-----------------------------------------

Returns a promise resolving with the checksum value calculated over
the data that can be either a buffer, string, number, boolean, null,
undefined, or arbitrary depth structure of arrays that contain
aforementioned data. The array structure is traversed depth first and
is written to the checksum algorithm without any separators.

Input data `['a', ['b', 'c'], ['d']]` therefore is equal to `'abcd'`.

```
'use strict';

const ph = require('unix-checksum-stream/promise');

(ph.data(['s1', 's2', [ 's3', [[[], 's4']], 's5']], 'crc32c', 'base64')
  .then(function(ret) {
	 console.log(ret);
	 process.exit(0);
 })
 .catch(function(e) {
	 console.log(e);
	 process.exit(1);
 }));
```


Disclaimer
==========

Disclaimers in unix-checksum package applies to this one too. On the
other hand the cryptographic hashes (e.g. SHA-256) that can also be
used with this library, are as strong as ever.


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
