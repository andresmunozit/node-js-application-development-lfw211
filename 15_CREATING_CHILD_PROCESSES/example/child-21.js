'use strict'
const { spawnSync } = require('child_process')

// The script we're executing writes to `sterr` with `console.error`, then pipes `stdin` to `stdout`
spawnSync(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    {
        // Providing input directly to the child process
        input: 'this input will become output\n',
        // `stdio` configuration. Here, `STDERR` is set to `ignore`, so its output won't be visible
        stdio: ['pipe', 'inherit', 'ignore']
    }
)
