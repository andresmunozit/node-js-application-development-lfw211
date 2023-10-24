'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        // The process we're spawning writes to `stderr` using `console.error`, and then pipes
        // `stdin` to `stdout` 
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // The `stdio` option is set to expose streams for all three `STDIO` devices. This is the
    // default.
    { stdio: ['pipe', 'pipe', 'pipe'] } // The `stdio` array indices match file descriptors: 0 for
                                        // `STDIN`, 1 for `STDOUT`, and 2 for STDERR.
)

// In the parent process we pipe the child process' `STDOUT` and `STDERR` to the parent `STDOUT`
sp.stdout.pipe(process.stdout)
sp.stderr.pipe(process.stdout)

// By setting `stdio[0]` to its default value of `pipe` (corresponding to `STDIN`), `sp.stdin` is
// made writable from the parent's perspective.
sp.stdin.write('this input will become output')
sp.stdin.end()
