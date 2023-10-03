'use strict'
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { pipeline } = require('stream')
const out = join(__dirname, 'out.txt')
pipeline(
    createReadStream(__filename, { encoding: 'utf-8' }),
    // With the `pipeline` method, we seamlessly read and write data in chunks without the need to
    // explicitly pass the contents, unlike in synchronous or asynchronous `writeFile` method.
    createWriteStream(out),
    (err) => {
        if (err) {
            console.log(err)
            return
        }
        console.log('finished writing')
    }
)
