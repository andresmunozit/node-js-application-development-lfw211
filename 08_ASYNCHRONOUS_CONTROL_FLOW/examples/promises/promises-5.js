const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const data = []
const print = (contents) => {
  console.log(contents.toString())
}
let count = files.length
let index = 0
const read = (file) => {
  return readFile(file).then((contents) => {
    index += 1
    data.push(contents)
    // This is crucial to understand: since `read` returns a Promise, this means that our current
    // `.then` handler is also returning a Promise. This chaining of Promises allows for serial
    // processing of asynchronous tasks.
    if (index < count) return read(files[index])

    // The `data` array containing the contents of all the processed files, will be passed to the
    // next `.then` handler if there's one attached to the Promise returned by the `read` function
    return data
  })
}

read(files[index]) // It receives the fist file in the `files` array
  .then((data) => {
    print(Buffer.concat(data))
  })
  .catch(console.error)
