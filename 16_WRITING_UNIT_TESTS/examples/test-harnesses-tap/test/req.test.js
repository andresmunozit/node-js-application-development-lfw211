'use strict'
// We'll use the `test` function to group assertions for different scenarios
const { test } = require('tap')
const req = require('../req')

// In the first group we're testing our mock network error scenario
// Since we're testing a callback-based API, we don't provide an async function to `test`, it's much
// easier to call a final callback to signal test completion, in this case it's the `end` function.
test('handles network error', ({ same, end }) => {
    req('http://error.com', (err, data) => {
        // `same` works the same as `deepStrictEqual`. We use it in both groups to check
        // the expected error and the expected buffer respectivelly.
        same(err, Error('network error'))
        // `tap` requires an explicit `end()` due to unpredictable asynchronous ops and to avoid
        // premature test completion, ensuring all assertions are executed.
        end()
    })
})

// In the second group we're testing our mock output
test('responds with data', ({ ok, same, error, end}) => {
    req('http://example.com', (err, data) => {
        // Since we're not expecting an error, `error` is not expected to throw.
        error(err)
        // The `ok` assertion checks for truthiness. `Buffer.isBuffer(data)` will return a boolean.
        ok(Buffer.isBuffer(data))
        
        // Since buffers are array-like, deep equality check will loop through every element in the
        // array and check them against each other.
        same(data, Buffer.from('some data'))
        // We use `end()` in both groups to avoid test timeouts and ensure assertions run before a
        // test group completes
        end()
    })
})
