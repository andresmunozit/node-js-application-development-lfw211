'use strict'
const { execSync } = require('child_process')

// `execSync` returns a buffer containing the output (from STDOUT) of the command.
const output = execSync(
    // Using backticks to execute a command without quote issues. In this case it's a Node command.
    `node -e "console.log('subprocess stdio output')"`
)
console.log(output.toString())
