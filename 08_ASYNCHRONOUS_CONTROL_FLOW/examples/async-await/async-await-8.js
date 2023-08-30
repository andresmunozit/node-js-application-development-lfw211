const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    const big = readFile(bigFile)
    const medium = readFile(mediumFile)
    const small = readFile(smallFile)

    // `then` attaches the `print` function as a callback to each promise
    // When a file is read, the `print` function will be called with the file's content, this
    // will ensure the contents are printed out chronologically
    big.then(print)
    medium.then(print)
    small.then(print)

    // Now await the promises. Note that the order of awaiting wouldn't affect the order of the
    // callback execution defined with `then`.
    await small
    await medium
    await big
}

run().catch(console.error)
