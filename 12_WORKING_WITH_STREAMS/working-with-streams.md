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
    // The incoming compressed data buffers are converted to BASE64 encoded strings and printed to
    // the console
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
'use strict'
const { Transform } = require('stream')
const { scrypt } = require('crypto')
const createTransformStream = () => {
    return new Transform({
        decodeStrings: false,
        encoding: 'hex',
        // `transform` option function serves both reading and writing purposes. It has a similar
        // signature to the `write` function in `Writable` streams.
        transform(chunk, enc, next) {
            // Using the async `crypto.scrypt` to showcase stream's functionality.
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                // The callback is executed after attempting to derive a cryptographic `key` using
                // the input data. It provides the derived `key` or returns an error if one occurs.
                if(err) {
                    // On error, trigger an `error` event on the stream
                    next(err)
                    return
                }
                // The `next` function sends the transformed data to the stream's readable side.
                // A null first argument indicates no error; the second argument results in a `data`
                // event.
                next(null, key)
            })
        }
    })
}

// Instantiate the stream and write payloads to it.
const transform = createTransformStream()
transform.on('data', (data) => {
    // Output data is in hex format due to the `encoding` option.
    console.log('got data:', data)
})
transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')

```
```txt
$ node streams-13.js
got data: 0b2fc9e2da62d8be9c0e20aa2a024ccb682ca4b980c960719faf7961cd4614ab
got data: bf5d30321e62edb7799305f55b9ae8dd0903f7f80153285e3b7288d72dc6a61d
got data: 5948d4437ac61783075269db7efa33650f537f8f775661f3d782b96580bcb22a
got data: d552a104ef061267719651e4d1a87c9590690d15cc7989f7ba8224f60e224e2a

```

The `PassThrough` constructor inherits from the `Transform` constructor. It's essentially a
transform stream where no transform is applied. For those familiar with Functional Programming this
has similar applicability to the identity function `((val) => val)`, that is, it's a useful
placeholder when a transform stream is expected but no transform is desired.

## Determining End-of-Stream
As we discussed before, there are at least four ways for a stream to potentially become inoperative:
- `close` event
- `error` event
- `finish` event
- `end` event

We often need to know when a stream is closed so that resources can be deallocated, otherwise
memory leaks become likely.

Instead of listening to all four events, the `stream.finised` utility function provides a simplified
way to do this:
```js
// s12_WORKING_WITH_STREAMS/examples/streams-14.js
'use strict'
const net = require('stream')
const { finished } = require('stream')
net.createServer((socket) => {
    const interval = setInterval(() => {
        socket.write('beat')
    }, 1000)
    socket.on('data', (data) => {
        socket.write(data.toString().toUpperCase())
    })
    // The callback triggers when the stream concludes or errors out.
    finished(socket, (err) =>  {    // The first argument is the stream and the second one is a
                                    // callback for when the stream ends for any reason
        // If the stream were to emit an error event the callback would be called with the error
        // object emitted by that event
        if(err) {
            console.error('there was a socket error', err)
        }
        clearInterval(interval)
    })
}).listen(3000)

```

```
$ node streams-14.js
# The application is blocked

```

This is a much safer way to detect when a stream ends and should be standard practice, since it
covers every eventuality.

## Piping Streams
Piping in Node.js is an abstraction for connecting streams, inspired by command line shells like
Bash. In Bash, `cat some-file | grep find-something` uses the pipe operator to direct the output of
one command as the input to another. Similarly, in Node.js, the `pipe` method achieves this
stream-to-stream data flow.

Let's addapt the TCP client server from the Readable-Writable-Streams example to use the `pipe`
method. Here is the TCP client implemented earlier:
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

We're going to create a new version of the client, whhere we will replace the `data` event listener
with a pipe:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-15.js
'use strict'
const net = require('net')
const socket = net.connect(3000)

// `process.stdout` is a `Writable` stream. Anything written to `process.stdout` will be printed out
// as process output
socket.pipe(process.stdout)

socket.write('hello')
setTimeout(() => {
    socket.write('all done')
    setTimeout(() => {
        socket.end()
    }, 250)
}, 3250)

```

Starting the example server from earlier and running the modified client result in the following:
```txt
# Server blocked
$ node streams-14.js

```

Note that there are no newlines, this is because we were using `console.log` before, which adds
a newline whenever is called: 
```txt
# Client
$ node streams-15.js 
HELLObeatbeatbeatALL DONE%
                   
```

The `pipe` method, found on `Readable` streams, allows data from a readable stream (like `socket`, a
`Duplex` stream) to be automatically written to a `Writable` stream. Internally the `pipe` method
sets up a `data` listener on the readable stream and automatically writes to the writable stream as
data become available.

Though you can chain pipe calls (e.g., `streamA.pipe(streamB).pipe(streamC)`), it's risky: if a
middle stream fails, others won't auto-close, potentially causing memory leaks. For safer piping of
multiple streams, use the `stream.pipeline` utility function.

Let's create a new pipeline of streams:
```js
// 12_WORKING_WITH_STREAMS/examples/streams-16.js
'use strict'
const net = require('net')
const { Transform, pipeline } = require('stream')
const { scrypt } = require('crypto')

// Create a transform stream to derive a key using `crypto.scrypt`.
const createTransformStream = () => {
    return new Transform({
        decodeStrings: false,
        encoding: 'hex',
        transform(chunk, enc, next) {
            // Derive a key from the incoming chunk
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                if (err) {
                    next(err)
                    return
                }
                // Emit the hex string of the derived key as a data event from the transform stream.
                next(null, key)
            })
        }
    })
}

// Start a TCP server
net.createServer((socket) => {
    const transform = createTransformStream()

    // Send 'beat' at one second intervals to the client.
    const interval = setInterval(() => {
        socket.write('beat')
    }, 1000)

    // Using the `pipeline` method, data from the socket triggers the transform stream's operations,
    // and the transformed data is sent back through the socket. This ensures seamless flow and
    // error handling.
    pipeline(socket, transform, socket, (err) => {
        if (err) {
            console.error('there was a socket error', err)
        }
        // Clear the interval to stop sending 'beat'
        clearInterval(interval)
    })
    // The pipeline takes care of `error` and `close` events, removing the need for the `finished`
    // utility
}).listen(3000)

```

This is the result of the execution:
```txt
# Application blocked
$ node streams-16.js

```
```
# Client
$ node streams-15.js
eb7ee7467667aeaa343ce22b58ead0a2cb4f640682c04746bfe5f2802a0908ccbeatbeatbeat3cca2402bf1973c8a30955e3
7b8656c104641db9e3bb09f823ab7b85919db4bc%

```

The `pipeline` method orchestrates the flow of data and events between streams.
**Steps**:
1. **Socket Data**: Server-side socket emits 'data' event on receipt.
2. **Transformation**: Data flows into the transform stream.
3. **Key Derivation**: Data is processed with `crypto.scrypt`.
4. **Emission**: Hex-format key is emitted as 'data'.
5. **Transmission**: Key is sent back via the server-side socket.
6. **Error Handling**: Any pipeline error triggers the final callback. No need for a `finished`
listener due to the pipeline's built-in error and completion management.

## Labs
### Lab 12.1 - Piping
The labs-1 folder has an index.js file containing the following:
```js
// labs-june-2023/labs/ch-12/labs-1/index.js
'use strict'
const { Readable, Writable } = require('stream')
const assert = require('assert')
const createWritable = () => {
    const sink = []
    let piped = false
    setImmediate(() => {
        assert.strictEqual(piped, true, 'use the pipe method')
        assert.deepStrictEqual(sink, ['a', 'b', 'c'])
    })
    const writable = new Writable({
        decodeStrings: false,
        write(chunk, enc, cb) {
            sink.push(chunk)
            cb()
        },
        final() {
            console.log('passed!')
        }
    })
    writable.once('pipe', () => {
        piped = true
    })
    return writable
}
const readable = Readable.from(['a', 'b', 'c'])
const writable = createWritable()

// TODO - send all data from readable to writable:

```

Use the appropriate method to make sure that all data in the readable stream is automatically
sent to the writable stream.

If successfully implemented the process will output: passed!

#### Solution
```js
// 12_WORKING_WITH_STREAMS/labs/labs-1/index.js
'use strict'
const { Readable, Writable } = require('stream')
const assert = require('assert')
const createWritable = () => {
    const sink = []
    let piped = false
    setImmediate(() => {
        assert.strictEqual(piped, true, 'use the pipe method')
        assert.deepStrictEqual(sink, ['a', 'b', 'c'])
    })
    const writable = new Writable({
        decodeStrings: false,
        write(chunk, enc, cb) {
            sink.push(chunk)
            cb()
        },
        final() {
            console.log('passed!')
        }
    })
    writable.once('pipe', () => {
        piped = true
    })
    return writable
}
const readable = Readable.from(['a', 'b', 'c'])
const writable = createWritable()

// Solution
readable.pipe(writable)

```
```txt
$ node index.js 
passed!

```

### Lab 12.2 - Create a Transform Stream
The labs-2 folder has an index.js file containing the following:
```js
// labs-june-2023/labs/ch-12/labs-2/index.js
'use strict'
const { Readable, Writable, Transform, PassThrough, pipeline } = require('stream')
const assert = require('assert')
const createWritable = () => {
    const sink = []
    const writable = new Writable({
        write(chunk, enc, cb) {
            sink.push(chunk.toString())
            cb()
        }
    })
    writable.sink = sink
    return writable
}
const readable = Readable.from(['a', 'b', 'c'])
const writable = createWritable()

// TODO: replace the pass through stream 
// with a transform stream that uppercases
// incoming characters
const transform = new PassThrough()

pipeline(readable, transform, writable, (err) => {
    assert.ifError(err)
    assert.deepStrictEqual(writable.sink, ['A', 'B', 'C'])
    console.log('passed!')
})

```

Replace the line that states `const transform = new PassThrough()` so that transform
is assigned to a transform stream that upper cases any incoming chunks. If successfully
implemented the process will output: passed!

#### Solution
```js
// 12_WORKING_WITH_STREAMS/labs/labs-2/index.js
'use strict'
const { Readable, Writable, Transform, PassThrough, pipeline } = require('stream')
const assert = require('assert')
const createWritable = () => {
    const sink = []
    const writable = new Writable({
        write(chunk, enc, cb) {
            sink.push(chunk.toString())
            cb()
        }
    })
    writable.sink = sink
    return writable
}
const readable = Readable.from(['a', 'b', 'c'])
const writable = createWritable()

// Solution
const transform = new Transform({
    decodeStrings: false,
    transform(chunk, enc, next) {
        next(null, chunk.toUpperCase())
    }
})

pipeline(readable, transform, writable, (err) => {
    assert.ifError(err)
    assert.deepStrictEqual(writable.sink, ['A', 'B', 'C'])
    console.log('passed!')
})

```
```
$  node index.js
passed!

```

## Knowledge Check
### Question 12.1
What method is used to automatically transfer data from a readable stream to a writable stream?
- A. send
- B. pipe [x]
- C. connect

### Question 12.2
What utility function should be used for connecting multiple streams together?
- A. pipeline [x]
- B. pipe
- C. compose

### Question 12.3
What's the difference between a Duplex stream and a Transform stream?
- A. Duplex streams establishes a causal relationship between read and write, Transform streams do
not
- B. Transform streams establishes a causal relationship between read and write, Duplex streams do
not [x]
- C. Nothing, they are aliases of the same thing
