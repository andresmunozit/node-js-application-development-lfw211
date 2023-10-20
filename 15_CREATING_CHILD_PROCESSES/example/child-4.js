'use strict'
const { execSync } = require('child_process')

try {
    // In this case nothing is writen to `STDERR`, instead `execSync` throws
    execSync(`"${process.execPath}" -e "process.exit(1)"`)
} catch (err) {
    console.error('CAUGHT ERROR:', err)
}
