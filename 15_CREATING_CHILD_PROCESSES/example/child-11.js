'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    ['-e', `console.log('subprocess stdio output')`]
)

// `sp.pid` is immediately available so we console it
console.log('pid is', sp.pid)

// Pipe child's `STDOUT` (readable for the parent) to the parent's `STDOUT`.
// Note: In the child, `process.stdout` is writable, while in the parent, `sp.stdout` is readable.
sp.stdout.pipe(process.stdout)

// To get the status code, we listen for a `close` event
sp.on('close', (status) => {
    console.log('exit status was', status)
})
