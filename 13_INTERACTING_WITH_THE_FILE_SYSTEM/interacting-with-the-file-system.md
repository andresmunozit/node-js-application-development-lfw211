# Interacting with the File System
## Introduction
Originally, JavaScript couldn't interact with the file system as it was browser-based. For
server-side tasks, Node introduced the `fs` module, supported by the `path` module. We'll explore
both

## File Paths
The `fs` and `path` modules manage the file system in Node. While `path` normalizes paths across
platforms, `fs` handles reading, writing, and other file operations. To locate a file, two
constants, `__filename` and `__dirname`, provide the absolute paths to the current file and its
directory, respectively.

Let's say we have the `interacting-fs-1.js` file at
`/home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILES_SYSTEM/examples/interacting-fs-1.js`:
```js
'use strict'
console.log('current filename', __filename)
console.log('current dirname', __dirname)

```

This would output the following:
```txt
$ node interacting-fs-1.js 
current filename /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-1.js
current dirname /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples

```

Even if we run the `interacting-fs-1.js` file from a different directory, the output will be the
same:
```txt
$ pwd
/home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM

$ node examples/interacting-fs-1.js 
current filename /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-1.js
current dirname /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples

```

The `path.join` method in Node is frequently used to handle platform-specific path differences.
Windows uses a different path separator than POSIX systems like Linux or macOS. Given this,
representing a Windows path in JavaScript requires escape characters due to the backslash.
`path.join` simplifies this by producing platform-appropriate paths.

Let's create a cross-platform path for the file `out.txt`, that is in the same directory as the
running file:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-2.js
'use strict'
const { join } = require('path')

// The file `out.txt` doesn't exist. The path returned by the `path.join` method will be printed.
console.log('out file:', join(__dirname, 'out.txt'))

```
```txt
$ node interacting-fs-2.js 
out file: /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/out.txt

```

On a Windows system, assuming the example file is located in `C:\\training\\ch-13` this will output
the file: `c:\\training\ch-13\out.txt`.

The `path.join` method can be passed as many arguments as desired, for instance
`path.join('foo', 'bar', 'baz')` will create the string `'foo/bar/baz'` or `'foo\\bar\\baz'`
depending on platform.

`path` methods in Node are mainly builders or *deconstructors*, with `path.isAbsolute` as an
exception which specifically checks if a path is absolute.

### Path Builders
Alongside `path.join` the other path *builders* are:
- **path.relative**: Given two absolute paths, calculates the relative path between them.
- **path.resolve**: Accepts several path strings and combines them, as if you're navigating from one
to the next using the cd command. So, `path.resolve('/foo', 'bar', 'baz')` will give you
`'/foo/bar/baz'`.
- **path.normalize**: Simplifies paths by resolving `..` and `.` segments and strips (removes) extra
slashes. For example, `path.normalize('/foo/../bar//baz')` translates to `'/bar/baz'`.
- **path.format**: Constructs a path string from an object, matching the structure returned by
`path.parse`.

### Path Deconstructors
The path *deconstructors* are `path.parse`, `path.extname`, `path.dirname` and `path.basename`.
Let's explore these with a code example:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-3.js
'use strict'
const { parse, basename, dirname, extname } = require('path')
console.log('filename parsed:', parse(__filename))
console.log('filename basename:', basename(__filename))
console.log('filename dirname:', dirname(__filename))
console.log('filename extname:', extname(__filename))

```

Given an execution path of
`/home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-3.js`
the following output will be the result on POSIX (e.g. non-Windows) systems:
```txt
$ node interacting-fs-3.js 
filename parsed: {
  root: '/',
  dir: '/home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples',
  base: 'interacting-fs-3.js',
  ext: '.js',
  name: 'interacting-fs-3'
}
filename basename: interacting-fs-3.js
filename dirname: /home/andres/code/andresmunozit/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples
filename extname: .js

```

On Windows, the `parse` method's output includes a drive letter in the `root` property, like `C:\`.
The result has paths with backslashes. `parse` yields an object with `root`, `dir`, `base`, `ext`
and `name`. While `base`, `dir`, and `ext` can be deduced with `path.dirname` and `path.basename`,
only `parse` provides `root` and `name`.

## Reading and Writing
The `fs` module offers both low and high-level APIs. Low-level APIs resemble POSIX system calls,
like `fs.open`, which mirrors the POSIX open command. Although we won't delve into these, they form
the foundation for the high-level APIs commonly used in application code.

The higher level methods for reading and writing are provided in four abstraction types:
- Synchronous
- Callback based
- Promise based
- Stream based

