'use strict'
const { EventEmitter } = require('events')

process.nextTick(console.log, 'passed!')

const ee = new EventEmitter()

// Let's add a listener to handle the `error` event
ee.on('error', (err) => { if (err.message !== 'timeout') throw err })

ee.emit('error', Error('timeout'))
