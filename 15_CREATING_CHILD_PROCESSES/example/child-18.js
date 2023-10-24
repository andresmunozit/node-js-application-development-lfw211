'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // Set child's `stdout` to inherit from the parent
    { stdio: ['pipe', 'inherit', 'pipe']}
)

// Only pipe child's `stderr`, as `stdout` is already inherited
sp.stderr.pipe(process.stdout)
sp.stdin.write('this input will become output')
sp.stdin.end()
