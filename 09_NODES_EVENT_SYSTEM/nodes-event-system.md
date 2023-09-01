# Node's Event System
The `EventEmitter` constructor in the `events` module is the functional backbone of many Node core
API's. For instance, HTTP and TCP servers are an event emitter, a TCP socket is an event emitter,
HTTP request and response objects are event emitters. In this section we'll explore how to create
and consume EventEmitters.

## Creating an Event Emitter
The events module exports an EventEmitter constructor:
```js
const { EventEmitter } = require('events')

```

In modern node the events module is the `EventEmitter` constructor as well:
```js
const EventEmitter = require('events')

```

Both forms are fine for contemporary Node.js usage.

To create a new event emitter, call the constructor with new:
```js
const myEmitter = new EventEmitter()

```

A more tipical pattern of usage is to inherit from `EventEmitter`:
```js
class MyEmitter extends EventEmitter {
    constructor(opts = {}) {{
        super(opts)
        this.name = opts.name
    }}
}

```

## Emitting Events
To emit an event call the `emit` method:
```js
const EventEmitter = require('events')
const myEmitter = new EventEmitter()

// The first argument is the event namespace, in order to listen to an event this namespace has to
// be known
// The subsequent arguments will be passed to the listener
myEmitter.emit('an-event', some, args)

```

The following is an example of using `emit` with inheriting from `EventEmitter`:
```js
const { EventEmitter } = require('events')
class MyEmitter extends EventEmitter {
    constructor (opts = {}) {
        super(opts)
        this.name = opts.name
    }

    // If `err` is  provided, an error event will be emitted, in any case the `close` event will be
    // emmitted next
    destroy(err) {
        if (err) { this.emit('error', err)}
        this.emit('close')
    }
}

```
