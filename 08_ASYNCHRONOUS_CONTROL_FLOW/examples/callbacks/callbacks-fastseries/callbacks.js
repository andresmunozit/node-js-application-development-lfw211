const { readFile } = require('fs')
const series = require('fastseries')()

const files = Array.from(Array(3)).fill(__filename)

// Define the function that will handle the result of reading all files. `data` is an array that
// will contain one entry per each successfull call to the `cb` function.
// The elements of the `data` array will be the second argument passed to each call to the `cb`
// function
const print  = (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(Buffer.concat(data).toString())
}

// Mapping the `files` array into an array of functions for `fastseries` to process
const readers = files.map((file) => {
  // The mapped functions have two parameters, `cb` is the callback function which we must call to
  // let `fastseries` know that an asynchronous operation has finished, so that it can continue to
  // processing the next function in the `readers` array
  return (_, cb) => { // `_` is a placeholder since the first parameter is not used
    readFile(file, (err, contents) => {
      if (err) cb(err) // Pass error to callback if there's an error
      else cb(null, contents) // Pass file contents to callback if read is successful
    })
  }
})

// Execute the array of functions (readers) serially, then call the 'print' callback at the end
series(null, readers, null, print)
