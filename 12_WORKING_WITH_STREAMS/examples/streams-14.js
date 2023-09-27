'use strict'
const net = require('net')
const { finished } = require('stream')
net.createServer((socket) => {
    const interval = setInterval(() => {
        socket.write('beat')
    }, 1000)
    socket.on('data', (data) => {
        socket.write(data.toString().toUpperCase())
    })
    // The callback triggers when the stream concludes or errors out.
    finished(socket, (err) =>  {    // The first argument is the stream and the second one is a
                                    // callback for when the stream ends for any reason
        // If the stream were to emit an error event the callback would be called with the error
        // object emitted by that event
        if(err) {
            console.error('there was a socket error', err)
        }
        clearInterval(interval)
    })
}).listen(3000)
