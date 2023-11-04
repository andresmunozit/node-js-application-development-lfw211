'use strict'
const add = require('../add')

// In this case `test` and `expect` are not being loaded from any module. These functions are made
// available by `jest` at execution time, so we cannot run our tests directly with node.
test('throw when inputs are not numbers', async () => {
    expect(() => add('5', '5')).toThrowError(
        Error('inputs must be numbers')
    )
    expect(() => add(5, '5')).toThrowError(
        Error('inputs must be numbers')
    )
    expect(() => add('5', 5)).toThrowError(
        Error('inputs must be numbers')
    )
    expect(() => add({}, null)).toThrowError(
        Error('inputs must be numbers')
    )
})
test('adds two numbers', async () => {
    expect(add(5, 5)).toStrictEqual(10)
    expect(add(-5, 5)).toStrictEqual(0)
})
