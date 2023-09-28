'use strict'
const { join } = require('path')

// The file `out.txt` doesn't exist. The path returned by the `path.join` method will be printed.
console.log('out file:', join(__dirname, 'out.txt'))
