'use strict'
const net = require('net')
const { Transform, pipeline } = require('stream')
const { scrypt } = require('crypto')

// Create a transform stream to derive a key using `crypto.scrypt`.
const createTransformStream = () => {
    return new Transform({
        decodeStrings: false,
        encoding: 'hex',
        transform(chunk, enc, next) {
            // Derive a key from the incoming chunk
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                if (err) {
                    next(err)
                    return
                }
                // Emit the hex string of the derived key as a data event from the transform stream.
                next(null, key)
            })
        }
    })
}

// Start a TCP server
net.createServer((socket) => {
    const transform = createTransformStream()

    // Send 'beat' at one second intervals to the client.
    const interval = setInterval(() => {
        socket.write('beat')
    }, 1000)

    // Using the `pipeline` method, data from the socket triggers the transform stream's operations,
    // and the transformed data is sent back through the socket. This ensures seamless flow and
    // error handling.
    pipeline(socket, transform, socket, (err) => {
        if (err) {
            console.error('there was a socket error', err)
        }
        // Clear the interval to stop sending 'beat'
        clearInterval(interval)
    })
    // The pipeline takes care of `error` and `close` events, removing the need for the `finished`
    // utility
}).listen(3000)
