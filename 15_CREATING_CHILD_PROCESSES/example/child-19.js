'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // We can set `stdio[2]` (child's stderr) to the writable stream `process.stdout`
    { stdio: ['pipe', 'inherit', process.stdout]}
)

// Now we don't need to explicitly pipe `sp.stderr` to `process.stdout`
sp.stdin.write('this input will become output')
sp.stdin.end()
