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
