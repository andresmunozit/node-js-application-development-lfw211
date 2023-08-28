const { readFile } = require('fs').promises
const [ bigFile,  mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile)
    .then((contents) => {
        print(contents)
        return readFile(mediumFile) // The `then` method return a promise
    })
    .then((contents) => {
        print(contents)
        return readFile(smallFile)
    })
    .then(print)
    .catch(console.error)