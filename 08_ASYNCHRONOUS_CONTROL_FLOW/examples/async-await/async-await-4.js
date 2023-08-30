const { readFile } = require('fs').promises

const print = (contents) => {
    console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run() {
    const data = []
    for (const file of files) {
        // Here we use an await inside a loop, which it's fitting for scenarios where operations
        // must be sequentially called
        data.push(await readFile(file))
    }
    print(Buffer.concat(data))
}

run().catch(console.error)
