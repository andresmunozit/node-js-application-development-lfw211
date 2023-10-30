const assert = require('assert')
const obj = {
    id: 1,
    name: { first: 'David', second: 'Clements' }
}

// This check will fail because objects are compared by reference, not value in JS
assert.equal(obj, {
    id: 1,
    name: { first: 'David', second: 'Clements' }
})
