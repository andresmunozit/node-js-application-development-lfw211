const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
    console.log(contents.toString())
}

// This is a parallel execution with sequential order
async function run() {
    const readers = files.map((file) => readFile(file))
    const data = await Promise.all(readers)
    print(Buffer.concat(data))
}

run().catch(console.error)
