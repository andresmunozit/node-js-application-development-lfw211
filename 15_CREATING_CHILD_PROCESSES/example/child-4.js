'use strict'
const { execSync } = require('child_process')

try {
    execSync(`"${process.execPath}" -e "process.exit(1)"`)
} catch (err) {
    console.error('CAUGHT ERROR:', err)
}
