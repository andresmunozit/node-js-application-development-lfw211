'use strict'
const req = require('../req')

test('handles network error', (done) => {
    req('http://error.com', (err, data) => {
        expect(err).toStrictEqual(Error('network error'))
        // In this callback-based, we call `done` to signal the end of this test case.
        done()
    })
})

test('responds with data', (done) => {
    req('http://example.com', (err, data) => {
        // `expect` doesn't have an equivalent to `ifError`. Using a coercive equality check will
        // result in the conditional being true if error is `null` or `undefined`
        expect(err == null).toBe(true)
        // `isBuffer` will return a boolean. We use `toBeTruthy` here to demonstrate how to achieve
        // the same behavior as `ok`
        expect(Buffer.isBuffer(data)).toBeTruthy()
        expect(data).toStrictEqual(Buffer.from('some data'))
        done()
    })
})
