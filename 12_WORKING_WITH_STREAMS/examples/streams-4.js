'use strict'
const { Readable } = require('stream')
const readable = Readable.from(['some', 'data', 'to', 'read'])

// This will result in the same output, `data` events will receive data as strings
readable.on('data', (data) => { console.log('got data', data) })
readable.on('end', () => { console.log('finished reading') })
