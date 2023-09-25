'use strict'
const { Writable } = require('stream')
const createWritableStream = (data) => {
    return new Writable({
        objectMode: true,// This creates an object mode writable stream
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWritableStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write(1)
writable.end('nothing more to write')
