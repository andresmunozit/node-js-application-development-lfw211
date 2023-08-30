const { readFile } = require('fs').promises
const files = [__filename, 'foo', __filename]
const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    // The async/await syntax is highly specialized for serial control flow
    const readers = files.map((file) => readFile(file))
    const results = await Promise.allSettled(readers)
    results
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        .filter(({status}) => status === 'fulfilled')
        .map(({value}) => value)

    print(Buffer.concat(data))
}

run().catch(console.error)
