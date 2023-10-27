# Writing Unit Tests
Testing is essential for any developer. An untested application isn't production-ready. In this
final chapter, we'll explore techniques for testing various API designs.

## Assertions
Assertions validate *values against conditions*, throwing errors if unmet. They're central to unit
and integration testing. 

The *core* `assert` module throws an `AssertionError` if the given value is falsy (convertible to
`false` using `!!val`). If the value passed to assert is truthy then it will not throw:
```txt
$ node -e "assert(false)"
node:assert:400
    throw err;
    ^

AssertionError [ERR_ASSERTION]: false == true
    at [eval]:1:1
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '=='
}

Node.js v18.15.0

```

The error thrown is an instance if `AssertionError`.

The *core* `assert` module has the following assertion methods:
- `assert.ok(val)` - the same as `assert(val)`, if `val` is truthy it will not throw
- `assert.equal(val1, val2)` - coercive  equal, `val1 == val2`
- `assert.notEqual(val1, val2)` - coercive unequal, `val1 != val2`
- `assert.strictEqual(val1, val2)` - strict equal, `val1 === val2`
- `assert.notStrictEqual(val1, val2)` - strict unequal, `val1 !== val2`
- `assert.deepEqual(obj1, obj2)` - coercive equal for all values in an object
- `assert.notDeepEqual(obj1, obj2)` - coercive unequal for all values in an object
- `assert.deepStrictEqual(obj1, obj2)` - strict equal for all values in an object
- `assert.notDeepStrictEqual(obj1, obj2)` - strict not equal for all values in an object
- `assert.throws(function)` - assert that function throws
- `assert.doesNotThrow(function)` - assert that function doesn't throw
- `assert.rejects(promise | async function)` - assert promise or returned promise rejects
- `assert.doesNotReject(promise | async function)` - assert promise or returned promise resolves
- `assert.ifError(err)` - check that an error object is falsy
- `assert.match(string, regex)` - test a string against a regular expression
- `assert.doesNotMatch(string, regex)` - test that a string fails a regular expression
- `assert.fail()` - force an `AssertionError` to be thrown

The Node core `assert` module doesn't provide feedback for successes; hence, there's no
`assert.pass` method, as it would equate to no action.

We can group assertions into the following categories:
- *Truthiness* (`assert` and `assert.ok`)
- *Equality* (strict and loose) and Pattern Matching (`match`)
- *Deep* equality (strict and loose)
- *Errors* (`ifError` plus `throws`, `rejects` and their antitheses)
- *Unreachability* (`fail`)

Third-party libraries offer alternative APIs and additional assertions, which we'll touch on later.
Yet, the core assertions usually suffice for writing effective tests. Overly complex assertions can
diminish clarity, as simpler assertions foster a shared understanding among developers.

When checking values, it's important to also verify their type. Consider a function `add` that sums
two numbers. Using:
```js
// example code
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.equal(add(2, 2), 4)

```

This test might pass even if `add` returns `'4'` (a string) or an object like `{ valueOf: () => 4 }`
because `assert.equal` can coerce types. To ensure `add` returns a number, you can also check its
type:
```js
// example code
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
const result = add(2, 2)
assert.equal(typeof result, 'number')
assert.equal(result, 4)

```
