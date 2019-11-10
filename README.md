In a Nutshell
=============

Stream wrapper around unix-checksum module implementing sum(1) (BSD
and SysV variants), cksum(1), CRC32 and CRC32C algorithms. Unlike the
parent module unix-checksum, this module can also make a streamable
version of all hash algorithms provided by crypto module (e.g. MD5,
SHA-1, SHA-256, SHA-512 and others).


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


Disclaimer
==========

Disclaimers in unix-checksum package applies to this one too.


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
