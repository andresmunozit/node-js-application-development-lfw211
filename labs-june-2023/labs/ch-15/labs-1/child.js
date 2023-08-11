'use strict'
const { join } = require('path')
const { writeFileSync } = require('fs')
writeFileSync(
  join(__dirname, (process.argv[2] || 'child') + '-env.json'), 
  JSON.stringify(process.env)
)