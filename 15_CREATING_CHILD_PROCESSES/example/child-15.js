'use strict'

const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'

const sp = spawn(process.execPath, ['-p', 'process.env'], {
    // We pass an options object with an `env` object
    env: {SUBPROCESS_SPECIFIC: 'ENV VAR'}
})

// `sp.stdout` stream will be written from the subprocess, by `node -p process.env`, then we pipe
// that to the parent's `stdout`
sp.stdout.pipe(process.stdout)
