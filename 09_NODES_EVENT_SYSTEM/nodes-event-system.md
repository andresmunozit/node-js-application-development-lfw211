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

## Listening for Events
You can attach a listener to an event emitter by using the `addListener` method or it's alias, the
`on` method:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-2.js
const { EventEmitter }  = require('events')

// We create an event emitter
const ee = new EventEmitter()

// We add an event listener, with an a listener function to the `ee` EventEmitter
ee.on('close', () => { console.log('close event fired') })

// Then we emit the `close` event
ee.emit('close')

```
```txt
$  node event-emitter-2.js 
close event fired

```

The arguments passed to `emit` are received by the listener function:
```js
// Pseudocode
ee.on('add', (a, b) => { console.log(a + b)}) // logs 13
ee.emit('add', 7, 6)

```

Order is important, the following event listener will not fire:
```js
// Pseudocode
ee.emit('close')

// The event is emitted before the listener is added
ee.on('close', () => {console.log('close event fired!')})

```

Listeners are called in the order that they are registered:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-3.js
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('my-event', () => {console.log('1st')})
ee.on('my-event', () => {console.log('2st')})
ee.emit('my-event')

```
```txt
$  node event-emitter-2.js 
1st
2st

```

The `prependListener` method can be used to inject a listener into the top position:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-4.js
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('my-event', () => {console.log('2st')})
ee.prependListener('my-event', () => {console.log('1st')})
ee.emit('my-event')

```

## Single Use Listener
An event can be emitted more than once:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-5.js
const { EventEmitter } =  require('events')
const ee = new EventEmitter()
ee.on('my-event', ()  => {console.log('my-event fired')})
ee.emit('my-event')
ee.emit('my-event')
ee.emit('my-event')

```
```txt
$ node event-emitter-5.js
my-event fired
my-event fired
my-event fired

```

The `once` method will immediately remove its own listener after it has been called:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-6.js
const {EventEmitter} = require('events')
const ee = new EventEmitter()
ee.once('my-event', () => {console.log('my-event fired')})
ee.emit('my-event')
ee.emit('my-event')
ee.emit('my-event')

```
```
$ node event-emitter-6.js
my-event fired

```

## Removing Listeners
The `removeListener` method can be used to remove a previously registered listener:
```js
const {EventEmitter} = require('events')
const ee = new EventEmitter()

const listener1 = () => {console.log('listener 1')}
const listener2 = () => {console.log('listener 2')}

ee.on('my-event', listener1)
ee.on('my-event', listener2)

// `setInterval(callback, delay)` schedules repeated execution of `callback` every `delay`
// milliseconds
setInterval(() => {
    // The `my-event` event is emitted every 200 milliseconds
    ee.emit('my-event')
}, 200)

setTimeout(() => {
    // After 500 milliseconds the `listener1` function is removed
    ee.removeListener('my-event', listener1)
}, 500)

setTimeout(() => {
    // At the 1100 milliseconds point, `listener2` is removed
    ee.removeListener('my-event', listener2)
}, 1100)

```
```txt
$ node event-emitter-7.js 
listener 1
listener 2
listener 1
listener 2
listener 2
listener 2
listener 2

```

The `removeAllListeners` method can be used to remove listeners without having a reference to their
function:
```js
// 09_NODES_EVENT_SYSTEM/examples/event-emitter-8.js
const {EventEmitter} = require('events')
const ee = new EventEmitter()

const listener1 = () => {console.log('listener 1')}
const listener2 = () => {console.log('listener 2')}

ee.on('my-event', listener1)
ee.on('my-event', listener2)
ee.on('another-event', ()  => {console.log('another event')})

setInterval(() => {
    // Both events are triggered every 300 ms
    ee.emit('my-event')
    ee.emit('another-event')
}, 200);

setTimeout(() => {
    // `removeAllListeners` can take an event name to remove all listeners for that given event
    // After 500 ms all listeners for 'my-event' are removed, so the two listeners are triggered
    // twice before they are removed
    ee.removeAllListeners('my-event')
}, 500);


setTimeout(() => {
    // `removeAllListeners` can also take no arguments in which case every listener on an event
    // emitter object will be removed
    // After 1100 milliseconds `removeAllListeners` method is called with no arguments, which
    // removes the remaining 'another-event' listener, thus it is called five times
    ee.removeAllListeners()
}, 1100)

```
```txt
$ node event-emitter-8.js
listener 1
listener 2
another event
listener 1
listener 2
another event
another event
another event
another event

```
