'use strict'
const os = require('os')

console.log('Hostname', os.hostname())

// The logged in user's home directory
console.log('Home dir', os.homedir())

// The path to the OS temporary directory. The temp folder auto-clears, ideal for short-term files.
console.log('Temp dir', os.tmpdir())
