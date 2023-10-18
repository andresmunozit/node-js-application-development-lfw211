'use strict'
const { execSync } = require('child_process')

// `execSync` doesn't capture `STDERR` output, so `output` will remain empty. Instead child process'
// `STDERR` will be routed to the parent's `STDERR` by default
const output = execSync(
    // The -e flag evaluates the given script. Here, the script writes to `STDERR`.
    `"${process.execPath}" -e "console.error('subprocess stdio output')"`
)

console.log(output.toString())
