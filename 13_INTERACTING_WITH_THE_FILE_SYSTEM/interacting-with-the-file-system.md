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

### Synchronous Methods
Synchronous methods in the `fs` module have names ending with 'Sync', like `fs.readFileSync`. These
methods block the process, making them useful for tasks at program startup. However, their use
should be minimized thereafter, since a blocked process can't manage requests or perform I/O until
the synchronous task finishes.

#### Reading
The following example will synchronously read its own contents into a buffer and then print it:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-4.js
'use strict'
const { readFileSync } = require('fs')
const contents = readFileSync(__filename)
console.log(contents)

```
```txt
$ node interacting-fs-4.js
<Buffer 27 75 73 65 20 73 74 72 69 63 74 27 0a 63 6f 6e 73 74 20 7b 20 72 65 61 64 46 69 6c 65 53 79
6e 63 20 7d 20 3d 20 72 65 71 75 69 72 65 28 27 66 73 27 ... 66 more bytes>

```

When `fs.readFileSync` is passed an options object with an encoding specified, this function will
return the file content as a string:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-5.js
'use strict'
const { readFileSync } = require('fs')
// Without the encoding option set, `readFileSync` returns buffer data
const contents = readFileSync(__filename, { encoding: 'utf8' })
console.log(contents)

```
```txt
$ node interacting-fs-5.js 
'use strict'
const { readFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf8' })
console.log(contents)

```

#### Writing
The `fs.writeFileSync` function writes a string or buffer to the specified file path. It blocks the
process until the write operation is fully completed.

In the following example, instead of logging the contents, we will convert them to uppercase and
write them to an `out.txt` file in the same directory.
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-6.js
'use strict'
const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf-8' })
writeFileSync(join(__dirname, 'out.txt'), contents.toUpperCase())

```
```txt
$ node interacting-fs-6.js
$ node -p "fs.readFileSync('out.txt').toString()"
'USE STRICT'
CONST { JOIN } = REQUIRE('PATH')
CONST { READFILESYNC, WRITEFILESYNC } = REQUIRE('FS')
CONST CONTENTS = READFILESYNC(__FILENAME, { ENCODING: 'UTF-8' })
WRITEFILESYNC(JOIN(__DIRNAME, 'OUT.TXT'), CONTENTS.TOUPPERCASE())

```

An options object can be passed to `fs.writeFileSync`, with a `flag` option set to 'a' to open a
file in append mode:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-7.js
'use strict'
const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf-8'})
writeFileSync(join(__dirname, 'out.txt'), contents.toUpperCase(), {
    flag: 'a',
})

```
```txt
$ node  interacting-fs-7.js
$ node -p "fs.readFileSync('out.txt').toString()"
'USE STRICT'
CONST { JOIN } = REQUIRE('PATH')
CONST { READFILESYNC, WRITEFILESYNC } = REQUIRE('FS')
CONST CONTENTS = READFILESYNC(__FILENAME, { ENCODING: 'UTF-8' })
WRITEFILESYNC(JOIN(__DIRNAME, 'OUT.TXT'), CONTENTS.TOUPPERCASE())

'USE STRICT'
CONST { JOIN } = REQUIRE('PATH')
CONST { READFILESYNC, WRITEFILESYNC } = REQUIRE('FS')
CONST CONTENTS = READFILESYNC(__FILENAME, { ENCODING: 'UTF-8'})
WRITEFILESYNC(JOIN(__DIRNAME, 'OUT.TXT'), CONTENTS.TOUPPERCASE(), {
    FLAG: 'A',
}) 

```

For a full list of supported flags, go to
[File System Flags](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fs_file_system_flags).

If there is a problem with an operation the `*Sync` APIs will throw. So to perform error handling
they need to be wrapped in a `try/catch block`. In this scenario, the `fs.chmodSync` method was
employed to deliberately produce an error. When the `fs.writeFileSync` method tried accessing the
file, it encountered a "permission denied" error.:
```txt
$ node -e "fs.chmodSync('out.txt', 0o000)"
$ node interacting-fs-7.js 
node:internal/fs/utils:347
    throw err;
    ^

Error: EACCES: permission denied, open '/.../out.txt'
    at Object.openSync (node:fs:601:3)
    at writeFileSync (node:fs:2249:35)
    at Object.<anonymous> (/.../interacting-fs-7.js:5:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  errno: -13,
  syscall: 'open',
  code: 'EACCES',
  path: '/.../out.txt'
}

Node.js v18.15.0

$ node -e "fs.chmodSync('out.txt', 0o666)"

```
The permissions were then restored at the end using `fs.chmodSync` again.

### Callback Based Methods
For `*Sync` APIs in Node, control flow is straightforward due to their sequential execution. Yet,
Node excels when I/O occurs asynchronously in the background. This leads us to callback and
promise-based filesystem APIs.

The asynchronous counterpart to `fs.readFileSync` is `fs.readFile`. Let's see an example that
includes UTF8 encoding and and error handling:
```js
'use strict'
const { readFile } = require('fs')
readFile(__filename, { encoding: 'utf8' }, (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents)
})

```
```txt
$ node interacting-fs-8.js
'use strict'
const { readFile } = require('fs')
readFile(__filename, { encoding: 'utf8' }, (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents)
})

```

For `fs.readFileSync`, the process stops and waits until the file is completely read. On the other
hand, in this example we use `fs.readFile` so execution is free to continue while the read operation
is performed. Once the reading is done, the callback provided to `readFile` is invoked with the
result. This non-blocking approach enables the process to handle other tasks, like processing an
HTTP request.

Let's asynchronously write the upper-cased content to `out.txt`, using the asynchronous function
`writeFile`:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-9.js
'use strict'
const { join } = require('path')
const { readFile, writeFile } = require('fs')
readFile(__filename, { encoding: 'utf8'}, (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    const out = join(__dirname, 'out.txt')
    writeFile(out, contents.toUpperCase(), (err) => {
        if (err) console.log(err)
    })
})

```
```txt
$ node interacting-fs-9.js 
$ node -p "fs.readFileSync('out.txt').toString()"
'USE STRICT'
CONST { JOIN } = REQUIRE('PATH')
CONST { READFILE, WRITEFILE } = REQUIRE('FS')
READFILE(__FILENAME, { ENCODING: 'UTF8'}, (ERR, CONTENTS) => {
    IF (ERR) {
        CONSOLE.ERROR(ERR)
        RETURN
    }
    CONST OUT = JOIN(__DIRNAME, 'OUT.TXT')
    WRITEFILE(OUT, CONTENTS.TOUPPERCASE(), (ERR) => {
        IF (ERR) CONSOLE.LOG(ERR)
    })
})

```

### Promise Based Methods
Promises are an asynchronous abstraction like callbacks. The difference is that we can use promises
with `async/await` functions to provide easy to read sequential instructions without blocking the
execution.

We're going to use the `fs/promises` API, which provides most of the same asynchronous methods
available in `fs`, except that `fs/promises` methods return promises instead of accepting callbacks.

`fs/promises` can also be loaded with `require('fs').promises`, which is backwards compatible with
legacy Node versions. However, `fs/promises`replaces `require('fs').promises`.

Let's look a reading/writing example using `fs/promises`:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-10.js
'use strict'
const { join } = require('path')
const { writeFile, readFile } = require('fs/promises')
async function run() {
    const contents = await readFile(__filename, { encoding: 'utf-8' })
    const out = join(__dirname, 'out.txt')
    await writeFile(out, contents.toUpperCase())
}
run().catch(console.error)

```
```txt
$ node interacting-fs-10.js 
$ node -p "fs.readFileSync('out.txt', {encoding: 'utf-8'})"
'USE STRICT'
CONST { JOIN } = REQUIRE('PATH')
CONST { WRITEFILE, READFILE } = REQUIRE('FS/PROMISES')
ASYNC FUNCTION RUN() {
    CONST CONTENTS = AWAIT READFILE(__FILENAME, { ENCODING: 'UTF-8' })
    CONST OUT = JOIN(__DIRNAME, 'OUT.TXT')
    AWAIT WRITEFILE(OUT, CONTENTS.TOUPPERCASE())
}
RUN().CATCH(CONSOLE.ERROR)

```

### Stream Based Methods
The `fs` module offers `fs.createReadStream` and `fs.createWriteStream` methods enabling read and
write files in chunks, which is optimal for processing large files incrementally.

In the next example we show an excellent pattern if dealing with a large file because the memory
usage will stay constant as the file is read in small chunks and written in small chunks:
```js
'use strict'
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { pipeline } = require('stream')
const out = join(__dirname, 'out.txt')
pipeline(
    createReadStream(__filename, { encoding: 'utf-8' }),
    // With the `pipeline` method, we seamlessly read and write data in chunks without the need to
    // explicitly pass the contents, unlike in synchronous or asynchronous `writeFile` method.
    createWriteStream(out),
    (err) => {
        if (err) {
            console.log(err)
            return
        }
        console.log('finished writing')
    }
)

```
```txt
$ node interacting-fs-11.js 
finished writing

# If we don't specify the encoding parameter, a buffer will be printed
$ node -p "fs.readFileSync('out.txt', { encoding: 'utf-8' })" 
'use strict'
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { pipeline } = require('stream')
const out = join(__dirname, 'out.txt')
pipeline(
    createReadStream(__filename, { encoding: 'utf-8' }),
    // With the pipeline method, we seamlessly read and write data in chunks without the need to
    // explicitly pass the contents, unlike in synchronous or asynchronous `writeFile` method.
    createWriteStream(out),
    (err) => {
        if (err) {
            console.log(err)
            return
        }
        console.log('finished writing')
    }
)

```

To produce the read, upper-case, write scenario we created in the previous section, we will need a
transform stream to upper-case the content:
```
```
