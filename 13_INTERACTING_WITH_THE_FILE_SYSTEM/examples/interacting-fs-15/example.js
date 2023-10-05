'use strict'
const { readdirSync, statSync } = require('fs')

// Read the directory we're currently in
const files = readdirSync('.')
for (const name of files) {
    const stat = statSync(name)
    const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
    console.log(typeLabel, name)
}
