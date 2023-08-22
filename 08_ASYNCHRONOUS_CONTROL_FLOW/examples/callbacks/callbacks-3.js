const { readFiles } = require('fs')

// Array.from() static method creates a new, shallow-copied Array instance from an iterable or
// array-like object
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

// Serial execution with callbacks is achieved by waiting for the callback to call before starting
// the next asynchronous operation
readFile(bigFile, (err, contents) => {
    print(err, contents)
    readFile(mediumFile, (err, contents) => {
        print(err, contents)
        readFile(smallFile, print)
    })
})
