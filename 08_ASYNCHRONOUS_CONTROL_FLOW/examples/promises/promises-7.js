const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
    results
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        .filter((({status}) => status === 'fulfiled'))
        .map((({value}) => value))
    
    const contents = Buffer.concat(data)
    console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

// The `Promise.allSettled` function returns an array of objects representing the settled status of
// each promise.
// Each object has a `status` property, which may be `rejected` of `fulfilled`
Promise.allSettled(readers)
    .then(print)
    .catch(console.error)
