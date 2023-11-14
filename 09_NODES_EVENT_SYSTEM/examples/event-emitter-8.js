const {EventEmitter} = require('events')
const ee = new EventEmitter()

const listener1 = () => {console.log('listener 1')}
const listener2 = () => {console.log('listener 2')}

ee.on('my-event', listener1)
ee.on('my-event', listener2)
ee.on('another-event', ()  => {console.log('another event')})

setInterval(() => {
    // Both events are triggered every 200 ms
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
