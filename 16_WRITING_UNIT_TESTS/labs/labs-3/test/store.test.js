const { test } = require('tap')
const store = require('../store')

test('handles wrong input', async ({ rejects }) => {
    await rejects(store('wrong input'))
})

test('returns an id', async ({ same, ok }) => {
    const { id } = await store(Buffer.from('test'))
    same(id.length, 4)
})
