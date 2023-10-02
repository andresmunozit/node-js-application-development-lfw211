'use strict'
const { readFileSync } = require('fs')
// Without the encoding, `readFileSync` returns raw buffer data
const contents = readFileSync(__filename, { encoding: 'utf8' })
console.log(contents)
