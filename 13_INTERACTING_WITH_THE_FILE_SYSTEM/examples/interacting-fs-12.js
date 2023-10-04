'use strict'
const { pipeline } = require('stream')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
// Custom stream to convert input text to uppercase
const createUppercaseStream = () => {
    return new Transform({
        transform(chunk, enc, next){
            const uppercased = chunk.toString().toUpperCase()
            next(null, uppercased)
        }
    })
}
pipeline(
    createReadStream(__filename), // Read from the current file in chunks
    createUppercaseStream(), // Convert each chunk to uppercase
    createWriteStream(join(__dirname, 'out.txt')),  // Write transformed chunks to 'out.txt'
    (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log('finished writing')
    }
)
