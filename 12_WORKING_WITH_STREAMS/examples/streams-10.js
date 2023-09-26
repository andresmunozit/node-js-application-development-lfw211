'use strict'
const net = require('net')

// Initialize server; listener function triggers upon client connection.
net.createServer((socket) => {  // Listener gets a Duplex stream, `socket`.
    const interval = setInterval(() => {
        // Using the writable side, write 'beat' to the stream every second.
        socket.write('beat')
    }, 1000)
    
    // Listen for `data` and `end` events on the readable side.
    socket.on('data', (data) => {
        // Respond with received data in upper case.
        socket.write(data.toString().toUpperCase())
    })
    
    // On client disconnect, cleanup resources; here, stopping the interval.
    socket.on('end', () => { clearInterval(interval) })
}).listen(3000)
