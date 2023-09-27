'use strict'
const { createGzip } = require('zlib')
const transform = createGzip()

// When data is written to the transform instance, `data` events emit compressed data on the
// readable side
// Event listeners don't block the execution; they await their specific events.
transform.on('data', (data) => {
    // The incoming compressed data buffers are converted to BASE64 encoded strings and printed to
    // the console
    console.log('got gzip data', data.toString('base64'))
})

// Writing data to the transform instance, initiating the compression process.
transform.write('first')
setTimeout(() => {
    // After a brief delay, more data is provided to the transform and then it's signaled to finish.
    transform.end('second')
}, 500)
