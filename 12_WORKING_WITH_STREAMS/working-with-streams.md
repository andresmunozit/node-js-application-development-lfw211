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
The Readable constructor creates readable streams. Readable streams can be used to:
- Read a file
- Read data from an incoming HTTP request
- Read user input from a command prompt, to name a few examples

The `Readable` constructor inherits from the `Stream` constructor which inherits from the
`EventEmitter` constructor, so readable streams are event emitters. As data becomes available, a
readable stream emits a `data` event.
