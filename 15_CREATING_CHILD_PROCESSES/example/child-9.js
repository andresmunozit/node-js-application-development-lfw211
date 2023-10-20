'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(
    process.execPath,
    ['-e', `console.log('subprocess stdio output')`]
)

// Let's print the content of the `STDOUT` of the subprocess
// `result.output[1]` contains the same as `result.stdout`
console.log(result.stdout.toString())
