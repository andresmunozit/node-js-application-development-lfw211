const assert = require('assert')
const { setTimeout: timeout } = require('timers/promises')
const pseudoReq = async (url) => {
    await timeout(300)
    if (url === 'http://error.com') throw Error('network error')
    return Buffer.from('some data')
}

// These assertions work with promises. If an assertion fails, the promise rejects with
// an `AssertionError` rather than throwing it directly.
assert.doesNotReject(pseudoReq('http://example.com'))
assert.rejects(pseudoReq('http://error.com'), Error('network error'))
