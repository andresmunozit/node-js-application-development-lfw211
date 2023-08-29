const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
    results
        // We filter all the rejected settled objects and pass the `reason` of each to
        // `console.error`
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        // Then we filter all fulfilled settled objects and create an array of just the values using
        // `map`
        .filter((({status}) => status === 'fulfilled'))
        .map((({value}) => value))
    
    const contents = Buffer.concat(data)
    console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

// The `Promise.allSettled` function returns an array of objects representing the settled status of
// each promise.
// Each object has a `status` property, which may be "rejected" of "fulfilled"
// Objects with a "rejected" `status` will  ccontain a `reason` property with the associated error
// Objects with a "fulfilled" `status` will have a `value` containing the resolved value
Promise.allSettled(readers)
    .then(print)
    .catch(console.error)
