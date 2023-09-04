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
