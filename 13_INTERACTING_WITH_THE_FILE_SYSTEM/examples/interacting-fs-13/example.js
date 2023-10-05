'use strict'
// Let's import synchronous and callback-based methods for reading a directory
const { readdirSync, readdir } = require('fs')
// We create the alias `readdirProm` for the promise based method, to prevent naming conflicts
const { readdir: readdirProm } = require('fs/promises')

try {
    // `readdirSync` blocks execution until it reads the directory, then returns filenames as an
    // async iterable
    console.log('sync', readdirSync(__dirname)) // `readdirSync` can throw so we use try/catch
} catch (err) {
    console.error(err)
}

// The files will be passed to the callback, once the directory has been read
readdir(__dirname, (err,  files) =>  {
    if (err) {
        console.error(err)
        return
    }
    console.log('callback', files)
})

async function run() {
    // The  directory is asynchronously read, so execution won't be blocked, but the `run` function
    // itself will pause until the awaited promise resolves or rejects
    const files = await readdirProm(__dirname)
    console.log('promise', files)
}

run().catch((err) => {
    console.error(err)
})
