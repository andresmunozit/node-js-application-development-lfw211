const { test } = require('tap')
const uppercase = require('../uppercase')

test('handles incorrect input', async ({ throws, doesNotThrow }) => {
    throws(() => uppercase(1), Error('must be a string'))
    throws(() => uppercase({}), Error('must be a string'))
    throws(() => uppercase(), Error('must be a string'))
    doesNotThrow(() => uppercase('hi'))
})

test('transforms to uppercase', async ({ same }) => {
    same(uppercase('hello'), 'HELLO')
    same(uppercase('Test'), 'TEST')
})
