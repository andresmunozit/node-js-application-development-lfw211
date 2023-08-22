// This program  will read its own source code and print it out
const { readFile } = require('fs')

// `_filename` in Node.js holds the path of the file currently being executed
// When the file has been read, the `readFile` function will call the function provided as the
// second argument
readFile(__filename, (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
})
