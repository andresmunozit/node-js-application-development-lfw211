'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
    // Instantiate a writable stream using the `Writable` constructor
    return new Writable({
        // The `write` function handles each data chunk
        // `chunk`: the data segment
        // `enc`: encoding (unused here)
        // `next`: callback signaling readiness for the next chunk
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWriteStream(data)

// Log the data once the stream is done
writable.on('finish', () => { console.log('Data written:', data) })
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('Final write')
