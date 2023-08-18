// Importing the required modules and utilities
import { realpath } from 'fs/promises' // Promise-based filesystem API from Node core
import { fileURLToPath } from 'url' // Utility function to convert file:// URLs to paths
import * as format from './format.js' // Import all named exports from `format.js` into a `format`
                                      // object

// Check if this module is the entry module executed by Node
// `process.argv`:Is an array containing the command line arguments passed when the Node.js process was launched
// `process.argv[0]`: Is the path to the Node.js executable itself
// `process.argv[1]`: Is the path to the JavaScript file being executed
const isMain = process.argv[1] &&
  await realpath(fileURLToPath(import.meta.url)) ===  // Convert current module's URL to path and
                                                      // normalize it
  await realpath(process.argv[1]) // Normalize entry file's path

// If this module is the main module being executed
if (isMain) {
  // Dynamically import pino using modern ESM's Top-Level Await
  const { default: pino } = await import('pino')
  const logger = pino()
  logger.info(format.upper('my-package started')) // Use the "upper" method from format.js
  process.stdin.resume()
}

// Default export of the module - a synchronous function
export default (str) => {
  return format.upper(str).split('').reverse().join('')
}
