const { readFile } = require('fs')
const series = require('fastseries')()

const files = Array.from(Array(3)).fill(__filename)

const print  = (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(Buffer.concat(data).toString())
}

const readers = files.map((file) => {
  return (_, cb) => {
    readFile(file, (err, contents) => {
      // if (err) cb(err)
      // Instead of calling `cb` with an error, log the error and return a new `Buffer`
      if (err) {
        print(err)
        cb(null, Buffer.alloc(0)) // Allocates a new `Buffer` of 0 bytes
      }
      else cb(null, contents)
    })
  }
})

series(null, readers, null, print)
