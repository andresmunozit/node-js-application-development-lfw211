'use strict'
const req = require('../req-prom')

test('handles network error', async () => {
    // Here we use `await` because `rejects` returns a promise
    await expect(req('http://error.com'))
        .rejects
        .toStrictEqual(Error('network error'))
})

test('responds with data', async () => {
    // If `req` rejects, it will be caught by the async function leading to an assertion failure.
    const data = await req('http://example.com')
    expect(Buffer.isBuffer(data)).toBeTruthy()    
    expect(data).toStrictEqual(Buffer.from('some data'))
})
