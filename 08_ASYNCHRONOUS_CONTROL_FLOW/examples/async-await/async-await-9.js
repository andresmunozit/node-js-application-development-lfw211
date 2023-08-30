const { promisify } = require('util')
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

// Here we've wrapped the callback-based parallel execution approach into a function 
// that accepts a callback (cb) and we've passed that whole function into promisify.
const read = promisify((cb) => {
    let index = 0
    const print = (err, contents) => {
        index += 1
        // Note that the `cb` function will be called only when the three files are read
        if (err) {
            console.error(err)
            if (index === 3) cb()
            return
        }
        console.log(contents.toString())
        if (index === 3) cb()
    }
    readFile(bigFile, print)
    readFile(mediumFile, print)
    readFile(smallFile, print)
})

async function run() {
    await read()
    // This means that our read function returns a promise that resolves 
    // when all three parallel operations are done, after which the run 
    // function logs out:
    console.log('finished!')
}

run().catch(console.error)
