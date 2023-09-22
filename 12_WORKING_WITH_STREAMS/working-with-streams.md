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
