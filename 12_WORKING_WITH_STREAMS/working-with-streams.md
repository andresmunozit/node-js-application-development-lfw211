# Working with Streams
Streams, prevalent in Node's core and libraries, efficiently handle vast data while conserving
resources. They also offer a functional programming advantage by modularizing real-time data
processing. This section delves into using best-practice patterns to use, create, and link streams
for progressive data pipelines.

## Stream Types
The Node core `stream` module exposes six constructors for creating streams:
- Stream
- Readable
- Writable
- Duplex
- Transform
- PassThrough

Other common Node core APIs such as `proccess`, `net`, `http`, `fs` and `child_process` expose
streams created with these constructors.

The `Stream` constructor is the default export of the `stream` module, and inherits from the
`EventEmitter` constructor from the `events` module:
```txt
$ node -p "stream + ''"
function Stream(opts) {
  EE.call(this, opts);
}

$ node -p "stream.prototype"
EventEmitter { pipe: [Function (anonymous)] }

$ node -p "Object.getPrototypeOf(stream.prototype)"
{
  _events: undefined,
  _eventsCount: 0,
  _maxListeners: undefined,
  setMaxListeners: [Function: setMaxListeners],
  getMaxListeners: [Function: getMaxListeners],
  emit: [Function: emit],
  addListener: [Function: addListener],
  on: [Function: addListener],
  prependListener: [Function: prependListener],
  once: [Function: once],
  prependOnceListener: [Function: prependOnceListener],
  removeListener: [Function: removeListener],
  off: [Function: removeListener],
  removeAllListeners: [Function: removeAllListeners],
  listeners: [Function: listeners],
  rawListeners: [Function: rawListeners],
  listenerCount: [Function: listenerCount],
  eventNames: [Function: eventNames]
}

```

The only thing the `Stream` constructor implements is the `pipe` method, which we will cover later.

The main events emitted by various `Stream` implementations that one may commonly encounter in
application-level code are:
- `data`
- `end`
- `finish`
- `close`
- `error`

In application-level code, `Stream` implementations often emit several key events:
- *Readable Stream:* `data` and `end`, emitted by Readable Streams.
- *Writable Stream:* `finish`, emitted by Writable streams once all data is written.
- *Common Events:* `close` and `error`. While `error` indicates a stream error, `close` signifies
the stream's destruction, possibly due to an unexpected underlying resource closure.

The `Stream` constructor is rarely used directly, but is inherited from by the other constructors.

## Stream Modes
There are two stream modes:
- Binary streams
- Object streams

The mode of a stream is determined by its `objectMode` option passed when the stream is
instantiated. The default `objectMode` is `false`, which means the default mode is binary.
*Binary mode* streams only read or write `Buffer` instances.

In *object mode*, streams can handle JavaScript objects and all primitive values like strings and
numbers, except for null. Despite its name, most *object mode* streams in Node primarily handle
strings. We'll delve into the distinctions between these modes and various stream types in the
following sections.

## Readable Streams
The `Readable` constructor creates readable streams. `Readable` streams can be used to:
- Read a file
- Read data from an incoming HTTP request
- Read user input from a command prompt, to name a few examples

The `Readable` constructor inherits from the `Stream` constructor which inherits from the
`EventEmitter` constructor, so readable streams are event emitters. As data becomes available, a
readable stream emits a `data` event.

The following is an example demonstrating the consuming of a readable stream:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-1.js
'use strict'
const fs = require('fs')
// `createReadStream` method instantiates an instance of the `Readable` constructor and then causes
// it to emit `data` events for each chunk of the file that has been read
const readable = fs.createReadStream(__filename) // __filename: The actual file executing this code

// Since this file is so small, only one data event  would be emitted, but readable streams have a
// default `highWaterMark` option  of 16kb, which means 16kb of data can be read before emitting a
// data event
readable.on('data',  (data) => { console.log(' got data', data) })

// When there is no more data for a readable stream to read, an `end` event is emitted
readable.on('end', () => { console.log('finished reading') })

```

```txt
$ node  streams-1.js 
 got data <Buffer 27 75 73 65 20 73 74 72 69 63 74 27 0a 63 6f 6e 73 74 20 66 73 20 3d 20 72 65 71
75 69 72 65 28 27 66 73 27 29 0a 2f 2f 20 60 63 72 65 61 74 65 52 65 ... 692 more bytes>
 finished reading

```

Readable streams typically manage input/output operations via integrations written in the C language
(referred to as a C-binding). However, for customized applications, we can craft our own version of
a readable stream using the `Readable` constructor:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-2.js
'use strict'
const { Readable } = require('stream')

const createReadStream = () => {
    const data = ['some', 'data', 'to', 'read']

    // Create a new instance of the Readable stream with a custom `read` method.
    return new Readable({
        // This `read` method is triggered when the internal mechanism of Node requests more data.
        read() {
            // The `push` method sends data chunks to the readable stream.
            // When there's no more data, signal the end-of-stream by pushing `null`.
            if (data.length === 0) this.push(null) // End-of-stream indicator
            else this.push(data.shift()) // Send the next piece of data
        }
    })
}

const readable = createReadStream()

// Listening for 'data' events to consume chunks from the readable stream.
readable.on('data', (data) => { console.log('got data', data) })

// Listening for the 'end' event which indicates that all data has been consumed.
readable.on('end', () => { console.log('finished reading') })

```

When this is executed, four `data` events are emitted, because our implementation pushes each item
in the stream. The `read` method takes an optional `size` argument that can be used to determine
how many bytes to read, this is the value set by the `highWaterMark` option which defaults to 16kb.

The following shows the result of executing the previous code:
```txt
$ node streams-2.js 
got data <Buffer 73 6f 6d 65>
got data <Buffer 64 61 74 61>
got data <Buffer 74 6f>
got data <Buffer 72 65 61 64>
finished reading

```

Notice that we pushed strings into our readable stream but when we pick them up in the data event
they are buffers. *Readable streams emit buffers by default*, which makes sense since most
use-cases of readable streams deal with binary data.

> Readable streams emit buffers by default

When initializing the readable stream, an `encoding` option can be set, enabling the stream to
automatically decode the buffer: 
```js
// 12_WORKING_WITH_STREAMS/examples/streams-3.js
const { Readable } = require('stream')
const createReadStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        // The `encoding` option decodes buffer (binary) data chunks to `utf8` encoded strings
        encoding: 'utf8',
        read() {
            if (data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadStream()
readable.on('data', (data) => { console.log('got data', data) })
readable.on('end', () => { console.log('finished reading') })

```

```txt
$ node streams-3.js 
got data some
got data data
got data to
got data read
finished reading

```

In this setup, the data chunks are direct strings; thus, the readable stream emits them without
initial buffer conversion.

Our code example can be condensed further using the `Readable.from` utility method which creates
streams from iterable data structures, like arrays:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-4.js
'use strict'
const { Readable } = require('stream')
const readable = Readable.from(['some', 'data', 'to', 'read'])

// This will result in the same output, `data` events will receive data as strings
readable.on('data', () => { console.log('got data', data) })
readable.on('end', () => { console.log('finished reading') })

```
```txt
$ node streams-4.js
got data some
got data data
got data to
got data read
finished reading

```

Contrary to the `Readable` constructor, the `Readable.from` utility functions set the `objectMode`
to `true` by default.

## Writable Streams
The `Writable` constructor creates writable streams. A writable stream could be used to write a
file, write data to an HTTP response, or write to the terminal. The  `Writable` constructor inherits
from the `EventEmitter` constructor, so writable streams are event emitters.

To send data to a writable stream, the `write` method is used:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-5.js
'use strict'
const fs = require('fs')
const writable = fs.createWriteStream('./out')

// The "finish" event is triggered once writing is complete.
writable.on('finish', () => { console.log('finished writing')})

// The `write` method queues up data to be written. Strings are automatically converted to buffers.
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')

// The `end` method writes a final chunk, then concludes the stream. This triggers the "finish"
// event.
writable.end('nothing more to write')

```

```txt
$ node streams-5.js
finished writing

$ node -p "fs.readFileSync('./out').toString()"
A
B
C
nothing more to write

```

Like readable streams, writable streams are primarily used for input/output tasks, often interacting
with native C-binding. However, we can also craft a simplified writable stream for demonstration
purposes:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-6.js
'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
    // Instantiate a writable stream using the `Writable` constructor
    return new Writable({
        // The `write` function handles each data chunk
        // `chunk`: the data segment
        // `enc`: encoding (unused here)
        // `next`: callback signaling readiness for the next chunk
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWriteStream(data)

// Log the data once the stream is done
writable.on('finish', () => { console.log('Data written:', data) })
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('Final write')

```
```txt
$ node streams-6.js 
Data written: [
  <Buffer 41 0a>,
  <Buffer 42 0a>,
  <Buffer 43 0a>,
  <Buffer 46 69 6e 61 6c 20 77 72 69 74 65>
]

```

Just like readable streams, the default `objectMode` for writable streams is `false`. Thus, strings
written to the writable stream are first transformed into buffers before being passed as the `chunk`
in the `write` function. You can prevent this conversion by setting `decodeStrings` to `false`:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-7.js
'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
    return new Writable({
        decodeStrings: false,
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWriteStream(data)
writable.on('finish', () => { console.log('finished writing', data)})
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing  more to write')

```
```txt
$ node streams-7.js
finished writing [ 'A\n', 'B\n', 'C\n', 'nothing  more to write' ]

```

This will only allow strings or Buffers to be written to the stream, trying to pass any other
JavaScript value will result in an error:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-8.js
'use strict'
const { Writable } = require('stream')

const createWriteStream = (data) => {
    return new Writable({
        // By setting `decodeStrings` to false, we're specifying that incoming strings won't be 
        // automatically converted to `Buffers`. Instead, they'll be passed as-is to the `write`
        // function.
        decodeStrings: false,
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}

const data = []
const writable = createWriteStream(data)

writable.on('finish', () => { console.log('finished writing', data) })

writable.write('A\n')
// This will throw an error. Since we disabled automatic string decoding and didn't handle other
// types, passing a number (non-string) isn't supported.
writable.write(1)
writable.end('nothing more to write')

```

The above code would result in an error, causing the process to crash, because we're attempting to
write a JavaScript value that isn't a string to a binary stream:
```txt

$ node streams-8.js 
node:internal/streams/writable:315
      throw new ERR_INVALID_ARG_TYPE(
      ^

TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of
Buffer or Uint8Array. Received type number (1)
    at new NodeError (node:internal/errors:399:5)
    at _write (node:internal/streams/writable:315:13)
    at Writable.write (node:internal/streams/writable:337:10)
    at Object.<anonymous> (/.../streams-8.js:25:10)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  code: 'ERR_INVALID_ARG_TYPE'
}

Node.js v18.15.0

```

Stream errors can be handled to avoid crashing the proccess, becacuse streams are event emitters and
the same *special case* for the `error` event applies.

If we want to support strings and any other JavaScript value, we can instead set `objectMode` to
`true` to create an *object-mode* writable stream:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-9.js
'use strict'
const { Writable } = require('stream')
const createWritableStream = (data) => {
    return new Writable({
        objectMode: true,// This creates an object mode writable stream
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWritableStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write(1)
writable.end('nothing more to write')

```

By creating an *object-mode* stream, writing the number 1 to the stream will no longer cause an
error:
```txt
$ node streams-9.js
finished writing [ 'A\n', 1, 'nothing more to write' ]

```

## Readable-Writable Streams
In addition to the `Readable` and `Writable` stream constructors there are three more core stream
constructors that have both readable and writable interfaces:
- Duplex
- Transform
- PassThrough

We will consume from all three, but only create the most common user stream: the `Transform` stream.

### Duplex
The `Duplex` stream constructor's prototype inherits from the `Readable` constructor, but it also
mixes in functionality from the `Writable` constructor.

A `Duplex` stream combines both reading and writing capabilities. However, writing to it doesn't
always affect what you read from it. Think of it like a two-way street where cars moving in one
direction don't necessarily influence the other. A good example of a Duplex stream is a TCP network
socket:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-10.js
'use strict'
const net = require('net')

// Initialize server; listener function triggers upon client connection.
net.createServer((socket) => {  // Listener gets a Duplex stream, `socket`.
    const interval = setInterval(() => {
        // Using the writable side, write 'beat' to the stream every second.
        socket.write('beat')
    }, 1000)
    
    // Listen for `data` and `end` events on the readable side.
    socket.on('data', (data) => {
        // Respond with received data in upper case.
        socket.write(data.toString().toUpperCase())
    })
    
    // On client disconnect, cleanup resources; here, stopping the interval.
    socket.on('end', () => { clearInterval(interval) })
}).listen(3000)

```

In order to interact with our server, we'll also create a small client. The client socket is also
a Duplex stream:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-11.js
'use strict'
const net = require('net')

// `net.connect` provides a Duplex stream representing the TCP client socket.
const socket = net.connect(3000)

socket.on('data', (data) => {
    // Listen for data events, convert received buffers to strings, and log them.
    console.log('got data', data.toString())
})

// Write a string using the writable side.
socket.write('hello')
setTimeout(() => {
    // Send another payload after 3.25 seconds.
    socket.write('all done')
    setTimeout(() => {
        // Close the stream after an additional 0.25 seconds.
        socket.end()
    }, 250)
}, 3250)

```

If  we starth both of the code examples as separate processes we can view the interaction:
```txt
$ # This is the server app
$ node streams-10.js 

```

```txt
$ # This is the client app
$ node streams-11.js 
got data HELLO
got data beat
got data beat
got data beat
got data ALL DONE

```

This example primarily aims to demonstrate the interaction with a Duplex stream, a common API
abstraction provided by the `net` module, rather than to explain the entire `net` module in detail.

### Transform
A `Transform` constructor inherits from the `Duplex` constructor. Transform streams are a type of
duplex stream, but they ensure a direct relationship between their `read` and `write`
functionalities. A good example is compression:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-12.js
'use strict'
const { createGzip } = require('zlib')
const transform = createGzip()

// When data is written to the transform instance, `data` events emit compressed data on the
// readable side
// Event listeners don't block the execution; they await their specific events.
transform.on('data', (data) => {
    // The incoming compressed data buffers are converted to BASE64 encoded strings and logged
    console.log('got gzip data', data.toString('base64'))
})

// Writing data to the transform instance, initiating the compression process.
transform.write('first')
setTimeout(() => {
    // After a brief delay, more data is provided to the transform and then it's signaled to finish.
    transform.end('second')
}, 500)

```

```txt
$ node streams-12.js 
got gzip data H4sIAAAAAAAAAw==
got gzip data S8ssKi4pTk3Oz0sBAP/7ZB0LAAAA

```

`Transform` streams establish a causal relationship by being designed differently. Rather than using
separate `read` and `write` functions, they take a single `transform` option when they're
constructed:
```js

```
