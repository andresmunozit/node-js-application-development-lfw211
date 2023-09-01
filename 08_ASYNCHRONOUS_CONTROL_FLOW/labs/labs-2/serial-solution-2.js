'use strict'
const { promisify } = require('util')

const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents) 
}

// Use `promisify` to return a promise and be able to use the async/await syntax
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

// The promises will resolve with the `contents` value
async function run() {
    print(null, await opA())
    print(null, await opB())
    print(null, await opC())
}

run()
