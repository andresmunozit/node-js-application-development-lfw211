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
`/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILES_SYSTEM/examples/interacting-fs-1.js`:
```js
'use strict'
console.log('current filename', __filename)
console.log('current dirname', __dirname)

```

This would output the following:
```txt
$ node interacting-fs-1.js 
current filename /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-1.js
current dirname /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples

```

Even if we run the `interacting-fs-1.js` file from a different directory, the output will be the
same:
```txt
$ pwd
/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM

$ node examples/interacting-fs-1.js 
current filename /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-1.js
current dirname /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples

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
out file: /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/out.txt

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
- `path.relative(from, to)`: Calculates the relative path between two absolute paths. Receives two
parameters: `from` (source path) and `to` (destination path).
- `path.resolve(...paths)`: Accepts several path strings and combines them, as if you're navigating
from one to the next using the cd command. So, `path.resolve('/foo', 'bar', 'baz')` will give you
`'/foo/bar/baz'`.
- `path.normalize(stringPath)`: Simplifies paths by resolving `..` and `.` segments and strips
(removes) extra slashes. For example, `path.normalize('/foo/../bar//baz')` translates to
`'/bar/baz'`.
- `path.format(pathObject)`: Constructs a path string from an object, matching the structure
returned by `path.parse`. Parameter: `pathObject` (object with properties like `dir` and `base`).
Example: `path.format({ dir: '/foo', base: 'bar' })` returns `'/foo/bar'`.

### Path Deconstructors
The `path` *deconstructors* are:
- `path.parse(stringPath)`: Parses a path into an object with properties like `root`, `dir`, `base`,
`ext`, and `name`.
- `path.extname(stringPath)`: Extracts the file extension from a path.
- `path.dirname(stringPath)`: Gets the directory name from a path.
- `path.basename(stringPath, ext)`: Returns the file name part of a path, optionally removing the
provided extension.

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
`/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-3.js`
the following output will be the result on POSIX (e.g. non-Windows) systems:
```txt
$ node interacting-fs-3.js 
filename parsed: {
  root: '/',
  dir: '/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples',
  base: 'interacting-fs-3.js',
  ext: '.js',
  name: 'interacting-fs-3'
}
filename basename: interacting-fs-3.js
filename dirname: /node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/examples
filename extname: .js

```

On Windows, the `parse` method's output includes a drive letter in the `root` property, like `C:\`.
The result has paths with backslashes.

`parse` yields an object with `root`, `dir`, `base`, `ext` and `name`. While `base`, `dir`, and
`ext` can be deduced with `path.dirname` and `path.basename`, only `parse` provides `root` and
`name`.

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

If there is a problem with an operation the `fs` *sync* APIs will throw. So to perform error
handling they need to be wrapped in a `try/catch block`. In this scenario, the
`fs.chmodSync(file_name, 0oXXX)` method
was employed to deliberately produce an error. When the `fs.writeFileSync` method tried accessing
the file, it encountered a "permission denied" error.:
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

The asynchronous *callback-based* counterpart to `fs.readFileSync` is `fs.readFile`. Let's see an
example that includes UTF8 encoding and and error handling:
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
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-12.js
'use strict'
const { pipeline } = require('stream')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
// Custom stream to convert input text to uppercase
const createUppercaseStream = () => {
    return new Transform({
        transform(chunk, enc, next){
            const uppercased = chunk.toString().toUpperCase()
            next(null, uppercased)
        }
    })
}
pipeline(
    createReadStream(__filename), // Read from the current file in chunks
    createUppercaseStream(), // Convert each chunk to uppercase
    createWriteStream(join(__dirname, 'out.txt')),  // Write transformed chunks to 'out.txt'
    (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log('finished writing')
    }
)

```
```txt
$ node -p "fs.readFileSync('out.txt').toString()" 
'USE STRICT'
CONST { PIPELINE } = REQUIRE('STREAM')
CONST { JOIN } = REQUIRE('PATH')
CONST { CREATEREADSTREAM, CREATEWRITESTREAM } = REQUIRE('FS')
CONST { TRANSFORM } = REQUIRE('STREAM')
// CUSTOM STREAM TO CONVERT INPUT TEXT TO UPPERCASE
CONST CREATEUPPERCASESTREAM = () => {
    RETURN NEW TRANSFORM({
        TRANSFORM(CHUNK, ENC, NEXT){
            CONST UPPERCASED = CHUNK.TOSTRING().TOUPPERCASE()
            NEXT(NULL, UPPERCASED)
        }
    })
}
PIPELINE(
    CREATEREADSTREAM(__FILENAME), // READ FROM THE CURRENT FILE IN CHUNKS
    CREATEUPPERCASESTREAM(), // CONVERT EACH CHUNK TO UPPERCASE
    CREATEWRITESTREAM(JOIN(__DIRNAME, 'OUT.TXT')),  // // WRITE TRANSFORMED CHUNKS TO 'OUT.TXT'
    (ERR) => {
        IF (ERR) {
            CONSOLE.ERROR(ERR)
            RETURN
        }
        CONSOLE.LOG('FINISHED WRITING')
    }
)

```

## Reading Directories
Directories are a special type of files which hold catalog information. Similar to files the `fs`
module provides multiple ways to *read* a directory:
- Syncrhonous
- Callback-based
- Promise-based
- An async iterable that inherits from `fs.Dir` (going into depth is beyond the scope of this
chapter, however you can check `Class fs.Dir`
[docs](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fs_class_fs_dir))

For each API approach, the benefits and drawbacks mirror those of reading and writing files. Avoid
synchronous execution in scenarios depending on asynchronous tasks, like handling HTTP requests.
Generally, callback or promise-based methods are ideal, but for very large directories, the
stream-like API is preferable.

Let's say we have a folder with the following files:
- `example.js`
- `file-a`
- `file-b`
- `file-c`

The `example.js` file would be the file that executes our code. Let's take a look at synchronous,
callback-based and promise based approaches at the same time, by reading a directory:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-13/example.js
'use strict'
// Let's import synchronous and callback-based methods for reading a directory
const { readdirSync, readdir } = require('fs')
// We create the alias `readdirProm` for the promise based method, to prevent naming conflicts
const { readdir: readdirProm } = require('fs/promises')

try {
    // `readdirSync` blocks execution until it reads the directory, then returns filenames as an
    // async iterable
    console.log('sync', readdirSync(__dirname)) // `readdirSync` can throw so we use try/catch
} catch (err) {
    console.error(err)
}

// The files will be passed to the callback, once the directory has been read
readdir(__dirname, (err,  files) =>  {
    if (err) {
        console.error(err)
        return
    }
    console.log('callback', files)
})

async function run() {
    // The  directory is asynchronously read, so execution won't be blocked, but the `run` function
    // itself will pause until the awaited promise resolves or rejects
    const files = await readdirProm(__dirname)
    console.log('promise', files)
}

run().catch((err) => {
    console.error(err)
})

```
```txt
$ node example.js
sync [ 'example.js', 'file-a', 'file-b', 'file-c' ]
callback [ 'example.js', 'file-a', 'file-b', 'file-c' ]
promise [ 'example.js', 'file-a', 'file-b', 'file-c' ]

```

Covering HTTP is out of the scope of this course, however we'll examine a more advanced case:
streaming directory contents over HTTP in JSON format:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-14/example.js
'use strict'
// Creates a new Server instance. The `requestListener` function auto-attaches to the 'request'
// event.
const { createServer } = require('http')
const { Readable, Transform, pipeline } = require('stream')
// Open a directory asynchronously using `fs.Dir`, which manages directory read and cleanup
// operations. Refer to POSIX opendir(3) for details
const { opendir } = require('fs')

// Create a Transform stream to format directory entries for JSON output.
// It receives `fs.Dirent` objects and outputs buffers.
const createEntryStream = () => {
    let syntax = '[\n'
    return new  Transform({
        writableObjectMode: true, // Accepts `fs.Dirent` objects
        readableObjectMode: false, // Outputs buffers

        // Accepts `fs.Dirent` objects, prepends a JSON prefix, and outputs formatted strings.
        transform(entry, enc, next) {
            // `syntax = '[\n'` will be the first element prepended e.g.:
            // entry.name = 'file1' -> transform  -> '[\nfile1'
            next(null, `${syntax} "${entry.name}"`)
            // After the first entry has writen, `syntax = ',\n'` will be prepended e.g.:
            // entry.name = 'file2' -> transform  -> ',\nfile2'
            syntax = ',\n'
        },

        // Close the JSON array before ending the stream
        final (cb) {
            this.push('\n]\n')
            cb()
        }
    })
}

createServer((req, res) => {
    if (req.url !== '/') {
        res.statusCode = 404
        res.end('Not Found')
        return
    }
    // Open the current directory and get the entries asynchronously
    opendir(__dirname, (err, dir) =>  {
        if (err) {
            res.statusCode = 500
            res.end('Server Error')
            return
        }
        // Convert the async iterable directory entries into a readable stream
        const dirStream = Readable.from(dir)

        // Get the transform stream for JSON formatting
        const entryStream = createEntryStream()
        res.setHeader('Content-Type', 'application/json')

        // Pipe the directory entries through our transform stream, then to the HTTP response
        pipeline(dirStream, entryStream, res, (err) => {
            if (err) console.log(err)
        })
    })
}).listen(3000)

```
```txt
$ node example.js

```
```txt
$ node -e "http.get('http://localhost:3000', (res) => res.pipe(process.stdout))"
[
 "file-b",
 "file-c",
 "file-a",
 "example.js"
]

```

## File Metadata
Metadata about files can be obtained with the following methods:
- `fs.stat`, `fs.statSync`, `fs/promises stat`
- `fs.lstat`, `fs.lstatSync`, `fs/promises lstat`

`fs.stat` returns an `fs.Stat` instance, which has various properties and methods to analyze file
metadata. `stat` follows symbolic links, while `lstat` gets metadata for the link itself. We'll
explore distinguishing files from directories and delve into available time stats.

We already know the sync vs. async API trade-offs. So for these examples we'll use `fs.statSync`.

### Is Directory? Using `stat`
Next, we'll identify directories in the current working directory:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-15/example.js
'use strict'
const { readdirSync, statSync } = require('fs')

// Read the directory we're currently in
const files = readdirSync('.')
for (const name of files) {
    const stat = statSync(name)
    const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
    console.log(typeLabel, name)
}

```
```txt
$ node example.js
dir:  a-dir
file:  a-file
file:  example.js

```

### Time Stats
There are four time stats available for files:
- **Access time**: Indicates the last time the file was accessed or read.
- **Change time**: Reflects the last time the file's metadata (like permissions or ownership) was
altered.
- **Modified time**: Marks the last time the file's content was written or modified.
- **Birth time**: Denotes when the file was created.

By default, these stats come as `Date` objects or milliseconds since the *epoch*. We'll use `Date`
objects and convert them to locale strings. Now, let's display these time stats for each file:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-16/example.js
'use strict'
const { readdirSync, statSync } = require('fs')
const files = readdirSync('.')
for (const name of files) {
    const stat = statSync(name)
    const typeLabel = stat.isDirectory() ? 'dir:'  :  'file:'
    const { atime, birthtime, ctime, mtime } = stat
    console.group(typeLabel, name) // Increases indentation of subsequent lines
    // `toLocaleString`: Converts date and time to a locale-specific string (locale: language &
    // region format).
    console.log('atime: ', atime.toLocaleString()) // `atime`: Access time
    console.log('ctime: ', ctime.toLocaleString()) // `ctime`: Change time
    console.log('mtime: ', mtime.toLocaleString()) // `mtime`: Modified time
    console.log('birthname: ', birthtime.toLocaleString())  // `birthtime`: Denotes when the file
                                                            // was created
    console.groupEnd()
    console.log()
}

```
```txt
$ node example.js 
dir: a-dir
  atime:  10/6/2023, 12:15:16 PM
  ctime:  10/6/2023, 12:15:15 PM
  mtime:  10/6/2023, 12:15:15 PM
  birthname:  10/6/2023, 12:15:15 PM

file: a-file
  atime:  10/6/2023, 12:15:23 PM
  ctime:  10/6/2023, 12:15:15 PM
  mtime:  10/6/2023, 12:15:15 PM
  birthname:  10/6/2023, 12:15:15 PM

file: example.js
  atime:  10/6/2023, 1:20:32 PM
  ctime:  10/6/2023, 1:20:32 PM
  mtime:  10/6/2023, 1:20:32 PM
  birthname:  10/6/2023, 12:15:15 PM

```

## Watching
`fs.watch` allows monitoring of file system changes. Though it's provided by Node core, it's a bit
low-level. For a more user-friendly experience, consider using the 'chokidar' library.

Here, we'll monitor the current directory, logging file changes and events:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-17.js
'use strict'
const { watch } = require('fs')

// This will keep the process open and watch the current directory
watch('.', (evt, filename) => {
    // This listener function is called with an event name and the related filename when any changes
    // occur in the directory.
    console.log(evt, filename)
})

```

Next you can find the code execution output:
```txt
$ node example.js
rename test
change test
rename test-dir
rename test-dir
change test
change test
rename test-dir
rename test

```

Here are the file manipulation commands that generated the events printed in the previous output:
```txt
$ node -e "fs.writeFileSync('test','test')"
$ node -e "fs.mkdirSync('test-dir')"       
$ node -e "fs.chmodSync('test-dir', 0o644)"
$ node -e "fs.writeFileSync('test','test')"
$ node -e "fs.chmodSync('test-dir', 0o644)"
$ node -e "fs.unlinkSync('test')"

```

`fs.watch` reflects the OS's low-level events, providing limited event detail. For a clearer
understanding, opt for the `chokidar` library or manually track file data.

Next we'll maintain a file list to detect additions and removals. To differentiate between content
and status updates, compare Modified and Change times. Equal times indicate content updates, while
differing times signal status updates. We can see an example bellow:
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-18/example.js
'use strict'
const { join, resolve } = require('path')
const { watch, readdirSync, statSync } = require('fs')

// Get the current working directory; `process.cwd()` is a common alternative.
const cwd = resolve('.')

// Initializes a `Set` with the list of filenames currently in the directory.
// `readdirSync('.')` synchronously retrieves filenames from the current directory.
// Possible output: Set { 'file1.txt', 'file2.js', 'folder1', ... }
const files = new Set(readdirSync('.'))
watch('.', (evt, filename) => {
    try {
        // Attempt to get file stats; if this method throws, likely means the file doesn't exist.
        const { ctimeMs, mtimeMs } = statSync(join(cwd, filename))
        if (files.has(filename) === false) {
            // If `filename` is new, set `evt` to 'created'.
            evt = 'created'
            files.add(filename)
        } else {
            // Check if change time equals modification time to determine update type.
            if (ctimeMs === mtimeMs) evt = 'content-updated'
            else evt = 'status-updated'
        }
    } catch (err) {
        // Handle file not found error by marking as 'deleted'; log other errors.
        if (err.code === 'ENOENT') {
            files.delete(filename)
            evt = 'deleted'
        } else {
            console.error(err)
        }
    } finally {
        // Log the calculated event and associated filename to the console
        console.log(evt, filename)
    }
})

```

If we execute our code, and the add a new file and delete it, it will output more suitable event
names:
```bash
# 13_INTERACTING_WITH_THE_FILE_SYSTEM/examples/interacting-fs-18/run-node-coms.sh
#!/bin/bash
set -x
node -e "fs.writeFileSync('test','test')"
node -e "fs.mkdirSync('test-dir')"       
node -e "fs.chmodSync('test-dir', 0o644)"
node -e "fs.writeFileSync('test','test')"
node -e "fs.chmodSync('test-dir', 0o644)"
node -e "fs.unlinkSync('test')"

```

```txt
$ node example.js
created test
content-updated test
created test-dir
status-updated test-dir
content-updated test
status-updated test-dir
deleted test

```
```txt
$ sudo chmod +x run-node-coms.sh
$ ./run-node-coms.sh
+ node -e 'fs.writeFileSync('\''test'\'','\''test'\'')'
+ node -e 'fs.mkdirSync('\''test-dir'\'')'
+ node -e 'fs.chmodSync('\''test-dir'\'', 0o644)'
+ node -e 'fs.writeFileSync('\''test'\'','\''test'\'')'
+ node -e 'fs.chmodSync('\''test-dir'\'', 0o644)'
+ node -e 'fs.unlinkSync('\''test'\'')'

```

## Labs
### Lab 13.1 - Read Directory and Write File
The labs-1 folder contains an index.js file containing the following:
```js
// labs-june-2023/labs/ch-13/labs-1/index.js
'use strict'
const assert = require('assert')
const { join, basename } = require('path')
const fs = require('fs')
const project = join(__dirname, 'project')
try { fs.rmdirSync(project, { recursive: true }) } catch (err) { }
const files = Array.from(Array(5), () => {
	return join(project, Math.random().toString(36).slice(2))
})
files.sort()
fs.mkdirSync(project)
for (const f of files) fs.closeSync(fs.openSync(f, 'w'))

const out = join(__dirname, 'out.txt')

function exercise() {
	// TODO read the files in the project folder
	// and write them to the out.txt file
}

exercise()
assert.deepStrictEqual(
	fs.readFileSync(out).toString().split(',').map((s) => s.trim()),
	files.map((f) => basename(f))
)
console.log('passed!')

```

The above code will generate a `project` folder and add five files to it with pseudo-randomly
generated filenames.

Complete the function named exercise so that all the files in the `project` folder, as stored in
the `project` constant, are written to the `out.txt` file as stored in the `out` constant. Only the
file names should be stored, not the full file paths, and file names should be comma separated.
For instance, given a project folder with the following files:
- `0p2ly0dluiw`
- `2ftl32u5zu5`
- `8t4iilscua6`
- `90370mamnse`
- `zfw8w7f8sm8`

The `out.txt` should then contain:
`0p2ly0dluiw,2ftl32u5zu5,8t4iilscua6,90370mamnse,zfw8w7f8sm8`

If successfully implemented, the process will output: `passed!`.

#### Solution
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/labs/labs-1/index.js
'use strict'
const assert = require('assert')
const { join, basename } = require('path')
const fs = require('fs') // Note that the entire `fs` API is imported
const project = join(__dirname, 'project')
try { fs.rmdirSync(project, { recursive: true }) } catch (err) { }

// Creates an array of length 5 and maps each element to a random string path.
// `join` appends the generated random string to the 'project' directory path.
const files = Array.from(Array(5), () => {
	return join(project, Math.random().toString(36).slice(2))
})
files.sort()
fs.mkdirSync(project)
for (const f of files) fs.closeSync(fs.openSync(f, 'w'))

const out = join(__dirname, 'out.txt')

function exercise() {
	// Read the files in the `project` folder
	const files = fs.readdirSync(project)

	// Write them to the `out.txt` file
	fs.writeFileSync(out, files.join(','))
}

exercise()
assert.deepStrictEqual(
	fs.readFileSync(out).toString().split(',').map((s) => s.trim()),
	files.map((f) => basename(f))
)
console.log('passed!')

```
```txt
$ node index.js
passed!
(node:3212518) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path,
{ recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead
(Use `node --trace-deprecation ...` to show where the warning was created)

```

### Lab 13.2 - Watching
The labs-2 folder contains an index.js file with the following:
```js
// labs-june-2023/labs/ch-13/labs-2/index.js
'use strict'
const assert = require('assert')
const { join } = require('path')
const fs = require('fs')
const fsp = require('fs/promises')
const { setTimeout: timeout } = require('timers/promises')
const project = join(__dirname, 'project')

try { fs.rmdirSync(project, { recursive: true }) } catch (err) {
    console.error(err)
}
fs.mkdirSync(project)

let answer = ''

async function writer() {
    const { open, chmod, mkdir } = fsp
    const pre = join(project, Math.random().toString(36).slice(2))
    const handle = await open(pre, 'w')
    await handle.close()
    await timeout(500)
    exercise(project)
    const file = join(project, Math.random().toString(36).slice(2))
    const dir = join(project, Math.random().toString(36).slice(2))
    const add = await open(file, 'w')
    await add.close()
    await mkdir(dir)
    await chmod(pre, 0o444)
    await timeout(500)
    assert.strictEqual(
        answer,
        file,
        'answer should be the file (not folder) which was added'
    )
    console.log('passed!')
    process.exit()
}

writer().catch((err) => {
    console.error(err)
    process.exit(1)
})

function exercise(project) {
    const files = new Set(fs.readdirSync(project))
    fs.watch(project, (evt, filename) => {
        try {
            const filepath = join(project, filename)
            const stat = fs.statSync(filepath)

            // TODO - only set the answer variable if the filepath
            // is both newly created AND does not point to a directory

            answer = filepath
        } catch (err) {

        }
    })
}

```
When executed (e.g., using node index.js) this code will create a folder named project
(removing it first if it already exists and then recreating it), and then perform some file system
manipulations within the project folder.

The writer function will create a file before calling the exercise function, to simulate a
pre-existing file, The exercise function will then be called which sets up a file watcher with
fs.watch. The writer function then proceeds to create a file, a directory and changes the
permissions of the previously existing file. These changes will trigger the listener function
passed as the second argument to fs.watch.

The goal is to ensure that the answer variable is set to the newly created file. So when a
directory is added, the answer variable should not be set to the directory path. When the
preexisting files status is updated via a permissions change, the answer variable should not be
set to that preexisting file.

If implemented correctly the process will output: `passed!`

#### Solution
```js
// 13_INTERACTING_WITH_THE_FILE_SYSTEM/labs/labs-2/index.js
'use strict'
const assert = require('assert')
const { join } = require('path')
const fs = require('fs')
const fsp = require('fs/promises')
const { setTimeout: timeout } = require('timers/promises')
const project = join(__dirname, 'project')

try { fs.rmdirSync(project, { recursive: true }) } catch (err) {
    console.error(err)
}
fs.mkdirSync(project)

let answer = ''

async function writer() {
    const { open, chmod, mkdir } = fsp
    const pre = join(project, Math.random().toString(36).slice(2))
    const handle = await open(pre, 'w')
    await handle.close()
    await timeout(500)
    exercise(project)
    const file = join(project, Math.random().toString(36).slice(2))
    const dir = join(project, Math.random().toString(36).slice(2))
    const add = await open(file, 'w')
    await add.close()
    await mkdir(dir)
    await chmod(pre, 0o444)
    await timeout(500)
    assert.strictEqual(
        answer,
        file,
        'answer should be the file (not folder) which was added'
    )
    console.log('passed!')
    process.exit()
}

writer().catch((err) => {
    console.error(err)
    process.exit(1)
})


// Solution
function exercise(project) {
    const files = new Set(fs.readdirSync(project))
    fs.watch(project, (evt, filename) => {
        try {
            const filepath = join(project, filename)
            const stat = fs.statSync(filepath)

            // TODO - only set the answer variable if the filepath
            // is both newly created AND does not point to a directory
            if (!stat.isDirectory() && !files.has(filename)) {
                answer = filepath
            }
        } catch (err) {

        }
    })
}

```
```txt
$ node index.js
Error: ENOENT: no such file or directory, lstat '/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/labs/labs-2/project'
    at Object.lstatSync (node:fs:1593:3)
    at __node_internal_ (node:internal/fs/utils:821:8)
    at Object.rmdirSync (node:fs:1216:15)
    at Object.<anonymous> (/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/labs/labs-2/index.js:9:10)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  errno: -2,
  syscall: 'lstat',
  code: 'ENOENT',
  path: '/node-js-application-development-lfw211/13_INTERACTING_WITH_THE_FILE_SYSTEM/labs/labs-2/project'
}
(node:62029) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead
(Use `node --trace-deprecation ...` to show where the warning was created)
passed!

```

**Note**: The program attempts to delete the `project` directory, and will print an error the first
time it will run because that directory doesn't exist yet. However the program keeps running and we
can see the output `passed!` at the end of the execution.

## Knowledge Check
### Question 13.1
When an `fs` module function name ends with the word Sync, what does this signify?
- A. That the operation will block the process from executing any more code until the operation has
completed [x]
- B. That the process will synchronize with the file system while code continues to execute
- C. That the operation will return a promise the resolves synchronously

### Question 13.2
What file stats must be used to verify that a file has been freshly created?
- A. birthtime, atime, ctime
- B. ctime
- C. birthtime, ctime, mtime [x]

### Question 13.3
Given a stats object named `stat` how can you check if the path that the stat object represents is a
directory?
- A. `stat.isDir`
- B. `stat.isDirectory()` [x]
- C. `stat.ino`
