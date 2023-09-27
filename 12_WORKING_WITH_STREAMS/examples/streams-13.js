'use strict'
const { Transform } = require('stream')
const { scrypt } = require('crypto')
const createTransformStream = () => {
    return new Transform({
        decodeStrings: false,
        encoding: 'hex',
        // `transform` option function serves both reading and writing purposes. It has a similar
        // signature to the `write` function in `Writable` streams.
        transform(chunk, enc, next) {
            // Using the async `crypto.scrypt` to showcase stream's functionality.
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                // The callback is executed after attempting to derive a cryptographic `key` using
                // the input data. It provides the derived `key` or returns an error if one occurs.
                if(err) {
                    // On error, trigger an `error` event on the stream
                    next(err)
                    return
                }
                // The `next` function sends the transformed data to the stream's readable side.
                // A null first argument indicates no error; the second argument results in a `data`
                // event.
                next(null, key)
            })
        }
    })
}

// Instantiate the stream and write payloads to it.
const transform = createTransformStream()
transform.on('data', (data) => {
    // Output data is in hex format due to the `encoding` option.
    console.log('got data:', data)
})
transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')
