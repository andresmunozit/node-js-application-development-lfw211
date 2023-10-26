'use strict'

const { spawn } = require('child_process')

function exercise(command, args) {
    const sp = spawn(command, args)

    // This is the equivalent of using the 'ignore' option for `stdin` in the `stdio` array. It ends
    // the writable stream.
    sp.stdin.end()
    sp.stdout.pipe(process.stdout)
    // sp.stderr is already a readable stream and will remain so

    return sp
}

module.exports = exercise
