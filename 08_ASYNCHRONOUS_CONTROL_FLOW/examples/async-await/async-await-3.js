const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // In this example, we don't need to relay on `index` or `count` variables
    const data = [
        // We populate the data declarativelly instead of using `push`
        // The async/await syntax allows for declarative asynchronous implementations
        await readFile(bigFile),
        await readFile(mediumFile),
        await readFile(smallFile),
    ]
    print(Buffer.concat(data))
}

run().catch(console.error)
