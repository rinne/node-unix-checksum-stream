In a Nutshell
=============

Stream wrapper around unic-checksum module implementing sum(1) (BSD
and SysV variants), cksum(1), CRC32 and CRC32C algorithms.


Reference
=========

```
'use strict';

const fs = require('fs');
const UnixChecksumStream = require('unix-checksum-stream');

(function() {
    var f = fs.createReadStream('GPL-2.0.TXT');
    // Supported algorithms: bsdsum, sysvsum, cksum, crc32, crc32c
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
emits 'digest' event including the numeric value of the checksum as a
parameter. Other encodings can be retrieved using digest() method on
the object.


Disclaimer
==========

Disclaimers in unix-checksum package applies to this one too.


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
