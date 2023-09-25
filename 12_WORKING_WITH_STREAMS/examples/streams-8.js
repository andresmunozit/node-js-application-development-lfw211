'use strict'
const { Writable } = require('stream')

const createWriteStream = (data) => {
    return new Writable({
        // By setting `decodeStrings` to false, we're specifying that incoming strings won't be 
        // automatically converted to `Buffers`. Instead, they'll be passed as-is to the write
        // function.
        decodeStrings: false,
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}

const data = []
const writable = createWriteStream(data)

writable.on('finish', () => { console.log('finished writing', data) })

writable.write('A\n')
// This will throw an error. Since we disabled automatic string decoding and didn't handle other
// types, passing a number (non-string) isn't supported.
writable.write(1)
writable.end('nothing more to write')
