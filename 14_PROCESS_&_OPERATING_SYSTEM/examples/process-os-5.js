'use strict'
// We replace the `console.log` call with a write to the `process.stderr` stream
process.stderr.write(process.stdin.isTTY ? 'terminal\n' : 'piped to\n')
const { Transform } = require('stream')
const createUppercaseStream = () => {
    return new Transform({
        transform(chunk, enc, next) {
            const uppercased = chunk.toString().toUpperCase()
            next(null, uppercased)
        }
    })
}

const uppercase = createUppercaseStream()
process.stdin.pipe(uppercase).pipe(process.stdout)
