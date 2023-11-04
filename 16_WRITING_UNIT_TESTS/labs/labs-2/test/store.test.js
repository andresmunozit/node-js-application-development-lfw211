const { test } = require('tap')
const store = require('../store')

test('handles wrong input', ({ same, end, ok }) => {
    // Other input data types can be tested, for this excercise it's enough this single case
    store('wrong input', (err, res) => {
        ok(err)
        same(err, Error('input must be a buffer'))
        end()
    })
})

test('returns an id', ({ error, same, end, ok }) => {
    store(Buffer.from('test'), (err, { id }) => {
        error(err)
        ok(id)
        same(id.length, 4)
        end()
    })
})
