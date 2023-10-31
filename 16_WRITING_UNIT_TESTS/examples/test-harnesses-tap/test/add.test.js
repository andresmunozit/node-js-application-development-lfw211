// Destructure the `test` function from the `tap` library for grouping assertions.
const { test } = require('tap')
const add = require('../add.js')

// First test group checks input validation.
// The async function's promise signals the test's completion. When the promise returned by the
// async function resolves, the test is done.
test('throw when inputs are not numbers', async ({ throws }) => {
    // Using `tap`'s own assertions without needing the `assert` module.
    // Destructure the `throws` assertion from the passed-in assertions object.
    throws(() => add('5', '5'), Error('inputs must be numbers'))
    throws(() => add(5, '5'), Error('inputs must be numbers'))
    throws(() => add('5', 5), Error('inputs must be numbers'))
    throws(() => add({}, null), Error('inputs must be numbers'))
    // The promise resolves at the function's end without awaiting any async operations
})

// Second test group verifies output correctness.
test('adds two numbers', async ({ equal }) => {
    // Use the `equal` assertion from the passed-in assertions object.
    equal(add(5, 5), 10)
    equal(add(-5, 5), 0)
})
