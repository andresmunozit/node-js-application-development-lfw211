'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        // Due to the `stdio[2]` configuration, the `console.error` won't generate visible output
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // Configuring `stdio[2]` as `ignore` means the subprocess's STDERR output is discarded
    { stdio: ['pipe', 'inherit', 'ignore']}
)

// Writing to the child process's stdin
sp.stdin.write('this input will become output\n')
sp.stdin.end()
