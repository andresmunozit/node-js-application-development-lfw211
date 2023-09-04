const { EventEmitter }  = require('events')

// We create an event emitter
const ee = new EventEmitter()

// We add an event listener to the `ee` EventEmitter
// We also add a listener function
ee.on('close', () => { console.log('close event fired') })

// Then we emit the `close` event
ee.emit('close')
