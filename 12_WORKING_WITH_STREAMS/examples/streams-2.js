'use strict'
const { Readable } = require('stream')

const createReadStream = () => {
    const data = ['some', 'data', 'to', 'read']

    // Create a new instance of the Readable stream with a custom `read` method.
    return new Readable({
        // This `read` method is triggered when the internal mechanism of Node requests more data.
        read() {
            // The `push` method sends data chunks to the readable stream.
            // When there's no more data, signal the end-of-stream by pushing `null`.
            if (data.length === 0) this.push(null) // End-of-stream indicator
            else this.push(data.shift()) // Send the next piece of data
        }
    })
}

const readable = createReadStream()

// Listening for 'data' events to consume chunks from the readable stream.
readable.on('data', (data) => { console.log('got data', data) })

// Listening for the 'end' event which indicates that all data has been consumed.
readable.on('end', () => { console.log('finished reading') })
