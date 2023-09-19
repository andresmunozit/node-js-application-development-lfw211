'use strict'
const { readFileSync } = require('fs')
const { readFile } = require('fs/promises')
const assert = require('assert')

async function read(file) {
    // Using a try/catch block to handle rejections
    try {
        const content = await readFile(file)
        return content
    } catch {
        // Throw an instance of `Error` with a specific message
        throw new Error('failed to read')
    }
}

async function check() {
    await assert.rejects(
        read('not-a-valid-filepath'),
        new Error('failed to read')
    )
    assert.deepEqual(
        await read(__filename),
        readFileSync(__filename)
    )
    console.log('passed!')
}

check()
