'use strict'
const { join } = require('path')
const { writeFile, readFile } = require('fs/promises')
async function run() {
    const contents = await readFile(__filename, { encoding: 'utf-8' })
    const out = join(__dirname, 'out.txt')
    await writeFile(out, contents.toUpperCase())
}
run().catch(console.error)
