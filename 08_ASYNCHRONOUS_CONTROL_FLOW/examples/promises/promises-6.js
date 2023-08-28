const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (data) => {
    console.log(Buffer.concat(data).toString())
}

// Let's create an array of promises
const readers = files.map((file) => readFile(file))

// The `Promise.all` function takes an array of promises and returns a promise that resolves when
// all promises have been resolved
Promise.all(readers)
    .then(print)
    .catch(console.error)
