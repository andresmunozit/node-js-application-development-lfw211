'use strict'
// Instead of printing "initialized", now it will print if our process is being piped to, or if the
// standard input is directly connected to the terminal
console.log(process.stdin.isTTY ? 'terminal' : 'piped to')
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
