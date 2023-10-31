const assert = require('assert')
const add = (a, b) => {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw Error('inputs must be numbers')
    }
    return a + b
}

// The second argument to `throws` can be an error; this error will be *deeply* and *strictly*
// compared with the error thrown by the provided function.
assert.throws(() => add('5', '5'), Error('inputs must be numbers'))

// We wrap the `add` invocation inside another function because `assert.throws` and
// `assert.doesNotThrow` require a function to check for thrown errors.
assert.doesNotThrow(() => add(5, 5))
