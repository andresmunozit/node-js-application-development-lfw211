'use strict'
const { readdirSync, statSync } = require('fs')
const files = readdirSync('.')
for (const name of files) {
    const stat = statSync(name)
    const typeLabel = stat.isDirectory() ? 'dir:'  :  'file:'
    const { atime, birthtime, ctime, mtime } = stat
    console.group(typeLabel, name) // Increases indentation of subsequent lines
    // `toLocaleString`: Converts date and time to a locale-specific string (locale: language &
    // region format).
    console.log('atime: ', atime.toLocaleString()) // `atime`: Access time
    console.log('ctime: ', ctime.toLocaleString()) // `ctime`: Change time
    console.log('mtime: ', mtime.toLocaleString()) // `mtime`: Modified time
    console.log('birthname: ', birthtime.toLocaleString())  // `birthtime`: Denotes when the file
                                                            // was created
    console.groupEnd()
    console.log()
}
