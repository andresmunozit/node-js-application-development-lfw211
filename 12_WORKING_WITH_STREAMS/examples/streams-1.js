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
readable.on('end', () => { console.log(' finished reading') })
