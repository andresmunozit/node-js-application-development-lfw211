'use strict'
const { test } = require('tap')
const req = require('../req-prom')

// Using async functions due to promises.
test('handles network errors', async ({ rejects }) => {
    // Using `rejects` assertion to check error passed. Await it since it returns a promise.
    await rejects(req('http://error.com'), Error('network error'))
})

test('responds with data', async ({ ok, same }) => {
    // If `req` rejects, it will be caught by the async function leading to an assertion failure.
    const data = await req('http://example.com')
    ok(Buffer.isBuffer(data))
    same(data, Buffer.from('some data'))
})
