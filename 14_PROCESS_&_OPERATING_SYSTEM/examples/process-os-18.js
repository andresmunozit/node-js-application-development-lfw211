'use strict'
const os = require('os')

// `os.platform` returns the host operating system, the same as `process.platform` property
console.log(os.platform())

// `os.type` gets the the Operating System identifier. On non-Windows systems uses the `uname`
// command and on Windows systems it uses the `ver` command
console.log('type', os.type())
