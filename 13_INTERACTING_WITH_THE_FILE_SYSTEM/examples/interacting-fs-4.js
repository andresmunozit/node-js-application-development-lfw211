'use strict'
const { readFileSync } = require('fs')
const contents = readFileSync(__filename)
console.log(contents)
