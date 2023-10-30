const assert = require('assert')
const obj = {
    id: 1,
    name: { first: 'David', second: 'Clements' }
}

// This will fail because `assert.strict.deepEqual` does not coerce types
assert.strict.deepEqual(obj, {
    id: '1', // This is a string
    name: { first: 'David', second: 'Clements' }
})
