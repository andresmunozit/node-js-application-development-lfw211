'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
    return new Writable({
        // `decodeStrings`: if true, decode strings into Buffers when writting the data. 
        decodeStrings: false,
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}
const data = []
const writable = createWriteStream(data)
writable.on('finish', () => { console.log('finished writing', data)})
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing  more to write')
