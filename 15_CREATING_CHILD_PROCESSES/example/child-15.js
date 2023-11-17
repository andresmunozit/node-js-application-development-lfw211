'use strict'

const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'

// We provide an options object as the third argument, which includes an `env` property.
const sp = spawn(process.execPath, ['-p', 'process.env'], {
    env: {SUBPROCESS_SPECIFIC: 'ENV VAR'}
})

// `sp.stdout` stream will be written from the subprocess, by `node -p process.env`, then we pipe
// that to the parent's `stdout`
sp.stdout.pipe(process.stdout)
