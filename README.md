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

UnixChecksumStream.algorithms()
-------------------------------

Returns an array of strings consisting of supported algorithms.

UnixChecksumStream.encodings()
------------------------------

Returns an array of strings consisting of supported digest encodings.


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


Command Line
============

This package contains also a kick-ass command line interface for
creating checksums from files, strings and standard input.

```
Usage:
  digest [<opt> ...] [<param> ...]
  Options:
    -a <arg>  --algorithm=<arg>         Hash algorithm to use
    -e <arg>  --digest-encoding=<arg>   Digest encoding to use
    -s <arg>  --string=<arg>            Hash a string
    -f <arg>  --file=<arg>              Hash a file
    -S        --hash-strings            Extra command line arguments are strings
    -F        --hash-files              Extra command line arguments are filenames
    -c        --compact                 Generate compact output
    -E        --list-digest-encodings
    -A        --list-algorithms
    -h        --help                    Show help and exit
```

The command executable file can be linked to a filename that is one of
the supported hash algorithm names, such as cksum or sha256, in which
case the hash algorithm automatically defaults to that particular
algorithm. Otherwise algorithm must be passed explicitly at command
line.

Output maintans the command line order with the exception that hashed
strings are always printed before hashed files in case both are
present in the command line.

If no files or strings are submitted, then the hash is calculated over
standard input.

```
$ digest -a md5 GPL-2.0.TXT
GPL-2.0.TXT: b234ee4d69f5fce4486a80fdaf4a4263

$ digest -a cksum GPL-2.0.TXT
GPL-2.0.TXT: 2811767965

$ ln -s digest sha256
$ ./sha256 GPL-2.0.TXT
GPL-2.0.TXT: 8177f97513213526df2cf6184d8ff986c675afb514d4e68a404010521b880643
```

It is possble to hash files as well as strings. Check out for the difference.

```
$ digest -a crc32 -e hex -s GPL-2.0.TXT -f GPL-2.0.TXT
"GPL-2.0.TXT": e172c837
GPL-2.0.TXT: 4e46f4a1

$ cat GPL-2.0.TXT | ./digest -a crc32 -e hex
<stdin>: 4e46f4a1

$ echo -n GPL-2.0.TXT | ./digest -a crc32 -e hex
<stdin>: e172c837
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
