'use strict'

if (require.main === module) {
  const pino = require('pino')
  const logger = pino()

  // Dynamic import can be fine in this case (we log out and resume STDIN), the only impact is that
  // the code takes slightly longer to execute
  import('./format.mjs').then((format) => {
    logger.info(format.upper('my-package started'))
    process.stdin.resume()
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })
} else {
  // In this branch we had to convert a synchronous function to use an asynchronous abstraction
  // We could have used a callback but we used an `async` function, since dynamicc import returns a
  // promise, we can `await` it
  let format = null
  const reverseAndUpper = async (str) => {
    format = format || await import('./format.mjs')
    return format.upper(str).split('').reverse().join('')
  }
  module.exports = reverseAndUpper
}
