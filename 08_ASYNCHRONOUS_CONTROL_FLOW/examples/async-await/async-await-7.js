// We don't need the `promises` version of `readFile`,  but the callback-based version
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

// The files are printed as soon as they are loaded
readFile(bigFile, print)
readFile(mediumFile, print)
readFile(smallFile, print)
