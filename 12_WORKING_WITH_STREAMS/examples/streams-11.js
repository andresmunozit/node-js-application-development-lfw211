'use strict'
const net = require('net')

// `net.connect` provides a Duplex stream representing the TCP client socket.
const socket = net.connect(3000)

socket.on('data', (data) => {
    // Listen for data events, convert received buffers to strings, and log them.
    console.log('got data', data.toString())
})

// Write a string using the writable side.
socket.write('hello')
setTimeout(() => {
    // Send another payload after 3.25 seconds.
    socket.write('all done')
    setTimeout(() => {
        // Close the stream after an additional 0.25 seconds.
        socket.end()
    }, 250)
}, 3250)
