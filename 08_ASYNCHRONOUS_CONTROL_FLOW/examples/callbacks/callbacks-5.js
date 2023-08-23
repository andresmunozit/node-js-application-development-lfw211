const { readFile } = require('fs')

// The files array is only a mock, The idea is that files array could be any length
const files = Array.from(Array(3)).fill(__filename)
const data = []
const print = (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}

// self-recursive function, `read`, is created along with two variables, `count` and `index`.
// `count`: amount of files to read
// `index`: represent the `index` in the array of files
let count = files.length
let index = 0
const read = (file) => {
  readFile(file, (err, contents) => {
    index += 1
    if (err) print(err)
    else data.push(contents)
    // Once a file has been read and added to the data array, read is called again if index < count
    if (index < count) read(files[index])
    else print(null, Buffer.concat(data)) // Otherwise the data array is concatenated and printed out
  })
}

read(files[index])
