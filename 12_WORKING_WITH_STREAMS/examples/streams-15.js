'use strict'
const net = require('net')
const socket = net.connect(3000)

// `process.stdout` is a `Writable` stream. Anything written to `process.stdout` will be printed out
// as process output
socket.pipe(process.stdout)

socket.write('hello')
setTimeout(() => {
    socket.write('all done')
    setTimeout(() => {
        socket.end()
    }, 250)
}, 3250)
