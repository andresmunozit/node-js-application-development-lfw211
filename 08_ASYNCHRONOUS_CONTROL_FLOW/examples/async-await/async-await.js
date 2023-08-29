const { readFile } = require('fs').promises

async function run() {
    // We use the `await` keyword on the promise value returned from `readFile`
    // This execution is paused until `readFile` resolves
    // When it resolves, the `contents` constant will be assigned the resolve value
    const contents = await readFile(__filename)

    // Then `contents` will be printed
    console.log(contents.toString())
}

// Here we call the async function `run`
// Async functions always returns a promise, so we can chain a `catch` method to ensure any
// rejections are handled, for example, in case `readFile` had an error 
run().catch(console.error)
