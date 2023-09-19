'use strict'
const assert = require('assert')

function parseUrl (str) {
  // We added a try/catch block to handle posible errors thrown in `URL(str)` execution
  try {
    const parsed = new URL(str)
    return parsed
  } catch {
    return null
  }
}

assert.doesNotThrow(() => { parseUrl('invalid-url') })
assert.equal(parseUrl('invalid-url'), null)
assert.deepEqual(
  parseUrl('http://example.com'), 
  new URL('http://example.com')
)
console.log('passed!')
