Changelog
=========

Unreleased
----------

- Uses Node's own stream module instead of readable-stream (was
  ^3, whose successor needs Node.js 12.22). The library still runs
  on Node.js 8.
- `data()` (promise.js) attached its listeners only after ending
  the stream, so with a stream that finishes synchronously (Node's
  own stream on Node.js 24 and later) the promise never settled.

2.7.1
-----

- `digest`: file names given as plain arguments replaced the files
  given with `-f`, and strings given with `-s` were also opened as
  files. Now `-f` files and plain arguments are all hashed as files.
- unix-checksum 4.4.1: cksum is right for input of 2 GiB or more.
- README: the 'digest' event, digest() and the promise functions give
  a buffer when no encoding is given (also for the checksums); the
  parameters of stream() and data() are named correctly.

2.7.0
-----

- The `digest` command line tool uses optist 3 (was 1), which needs
  Node.js 20 or newer. The library itself is unchanged and still runs
  on Node.js 8.
- readable-test-data-stream, used only by the tests, is a development
  dependency.
- Fixed the repository URL in package.json.

Earlier versions have no changelog.
