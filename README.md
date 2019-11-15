In a Nutshell
=============

Stream wrapper around unix-checksum module implementing sum(1) (BSD
and SysV variants), cksum(1), CRC32 and CRC32C algorithms. This
module can also make a streamable version of all hash algorithms
provided by crypto module (e.g. MD5, SHA-1, SHA-256, SHA-512 and
others).

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
        console.log(s.result( [ 'hex', 'base64', 'number', 'buffer' ] ));
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

Alias of UnixChecksumStream.getHashes().

UnixChecksumStream.getHashes()
------------------------------

Returns an array of strings consisting of supported algorithms.

UnixChecksumStream.encodings()
------------------------------

Alias of UnixChecksumStream.getDigestEncodings().

UnixChecksumStream.getDigestEncodings()
---------------------------------------

Returns an array of strings consisting of supported digest encodings.

UnixChecksumStream.prototype.digest(digestEncoding)
---------------------------------------------------

Returns the result digest of the checksum calculation. This interface
can be called multiple times, but can only be called after
the stream has ended (i.e. `finish` or `digest` event has been
received).

digestEncoding is a string specifying a valid encoding. In case this
is omitted, the default digest specific encoding is used.

UnixChecksumStream.prototype.result(digestEncodings)
----------------------------------------------------

Returns an object describing the full return value of the checksum
calculation. This interface can be called multiple times, but can only
be called after the stream has ended (i.e. `finish` or `digest` event
has been received).

digestEncodings is either a string or array of strings with valid
encodings that are to be included into the `digests` property of the
return object. Property `digest` always contains a default encoding
for the hash in question.


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
    -a <arg>  --algorithm=<arg>          Hash algorithm to use.
    -e <arg>  --digest-encoding=<arg>    Digest encoding to use.
    -m        --multi-algorithm-output   Use output format of multiple algorithms even in case of one.
    -o        --one-algorithm-output     Use output format of one algorithm even in case of multiple ones.
    -s <arg>  --string=<arg>             Hash a string.
    -f <arg>  --file=<arg>               Hash a file.
    -S        --hash-strings             Extra command line arguments are strings.
    -F        --hash-files               Extra command line arguments are filenames.
    -c        --compact                  Generate compact output.
    -E        --list-digest-encodings
    -A        --list-algorithms
    -h        --help                     Show help and exit
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

For whatever reason, it is even possible to calculate results using
multiple algorithms at one go.

```
./digest -a md5 -a sha1 -a sha256 -a sha384 -a sha512 -s ''
md5(""): d41d8cd98f00b204e9800998ecf8427e
sha1(""): da39a3ee5e6b4b0d3255bfef95601890afd80709
sha256(""): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
sha384(""): 38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b
sha512(""): cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e
```

Option -m forces the output format of multiple algorithms even in the
situation where only one is provided. Option -o forces output like
single algorithm even in case of multiple ones, which may be
confusing.


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
