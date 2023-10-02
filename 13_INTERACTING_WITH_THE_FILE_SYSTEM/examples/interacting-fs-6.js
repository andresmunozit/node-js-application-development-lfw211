'use strict'
const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf-8' })
writeFileSync(join(__dirname, 'out.txt'), contents.toUpperCase())

