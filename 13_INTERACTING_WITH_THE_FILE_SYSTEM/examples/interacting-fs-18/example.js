'use strict'
const { join, resolve } = require('path')
const { watch, readdirSync, statSync } = require('fs')

// Get the current working directory; `process.cwd()` is a common alternative.
const cwd = resolve('.')

// Initializes a `Set` with the list of filenames currently in the directory.
// `readdirSync('.')` synchronously retrieves filenames from the current directory.
// Possible output: Set { 'file1.txt', 'file2.js', 'folder1', ... }
const files = new Set(readdirSync('.'))
watch('.', (evt, filename) => {
    try {
        // Attempt to get file stats; if this method throws, likely means the file doesn't exist.
        const { ctimeMs, mtimeMs } = statSync(join(cwd, filename))
        if (files.has(filename) === false) {
            // If `filename` is new, set `evt` to 'created'.
            evt = 'created'
            files.add(filename)
        } else {
            // Check if change time equals modification time to determine update type.
            if (ctimeMs === mtimeMs) evt = 'content-updated'
            else evt = 'status-updated'
        }
    } catch (err) {
        // Handle file not found error by marking as 'deleted'; log other errors.
        if (err.code === 'ENOENT') {
            files.delete(filename)
            evt = 'deleted'
        } else {
            console.error(err)
        }
    } finally {
        // Log the calculated event and associated filename to the console
        console.log(evt, filename)
    }
})
