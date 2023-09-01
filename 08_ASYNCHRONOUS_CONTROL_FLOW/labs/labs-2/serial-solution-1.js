'use strict'
const { promisify } = require('util')

const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents) 
}

// Use `promisify` to be able of using `then` and `catch` for managing the serial execution
const opA = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
})

const opB = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
})

const opC = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
})

// Chain the asynchronous operations using `then` and returning a promise for the next operation
opA()
    .then((err, contents) => {
        print(err, contents)
        return opB()
    })
    .then((err, contents) => {
        print(err, contents)
        return opC()
    })
    .then((err, contents) => {
        print(err, contents)
    })
    .catch(console.error)
