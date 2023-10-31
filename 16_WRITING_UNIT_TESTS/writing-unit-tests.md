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

The error thrown is an instance of `AssertionError`.

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

> In this context, *coercive* means allowing type conversion when comparing values.

We can group assertions into the following categories:
- *Truthiness* (`assert` and `assert.ok`)
- *Equality* (strict and loose) and Pattern Matching (`match`)
- *Deep equality* (strict and loose)
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

// If `add` doesn't return the number 4, the `typeof` check will throw
assert.equal(typeof result, 'number')
assert.equal(result, 4)

```

The other way to handle this is `assert.strictEqual`:
```js
// example code
const assert = require('assert')
const add = require('./get-add-from-somewhere')

// `strictEqual` checks both, value and type, if `add` desn't return 4 as a number an
// `AssertionError` will be thrown
assert.strictEqual(add(2, 2), 4)

```

We can also use the `assert.strict` namespace to access to strict methods:
```js
// example code
const assert = require('assert')
const add = require('./get-add-from-somewhere')
assert.strict.equal(add(2, 2), 4)

```

Note that `assert.equal` and other non-strict (i.e. *coercive*) assertion methods are deprecated
(they may one day be removed). Therefore using `assert.strict` or strict assertion methods like
`assert.strictEqual` is best practice.

All the assertion libraries work essentially the same. That is, an `AssertionError` will be thrown
if a condition is not met.

Let's see the same example using the `expect` library:
```js
// example code
const expect = require('expect')
const add = require('./get-add-from-somewhere')

// `expect` returns an object with assertion methods. For coercive equality you can use the
// `expect(...).equal(...)` method
expect(add(2, 2)).toStrictEqual(4)

```

The `expect` library will throw an `JestAssertionError`, which contains extra information. `expect`
is part of the Jest test runner which we'll explore later.

Basic equality checks like `assert.equal` aren't sufficient for comparing objects because JavaScript
determines object equality based on their references, not their content:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-2.js
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

```
```
$ node testing-2.js
node:assert:124
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: {
  id: 1,
  name: {
    first: 'David',
    second: 'Clements'
  }
} == {
  id: 1,
  name: {
    first: 'David',
    second: 'Clements'
  }
}
    at Object.<anonymous> (/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/testing-2.js:8:8)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: { id: 1, name: { first: 'David', second: 'Clements' } },
  expected: { id: 1, name: { first: 'David', second: 'Clements' } },
  operator: '=='
}

Node.js v18.15.0

```

Deep equality checks like `assert.deepEqual` examine the entire structure of objects and compare the
basic values within them for equality:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-2.js
const assert = require('assert')
const obj = {
    id: 1,
    name: { first: 'David', second: 'Clements'}
}
assert.deepEqual(obj, {
    id: 1,
    name: { first: 'David', second: 'Clements'}
})

```
```txt
$ node testing-2.js
$ echo  $?         
0

```

`assert.deepEqual` performs a coercive check, this means that the following check will also pass:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-3.js
const assert = require('assert')
const obj = {
    id: 1,
    name: { first: 'David', second: 'Clements' }
}

// `id` is a string but this will pass because it's not strict
assert.deepEqual(obj, {
    id:'1',
    name: { first: 'David', second: 'Clements' }
})

```
```txt
$ node testing-3.js
$ echo  $?         
0

```

It's recommended to use *strict* equality in most cases:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-4.js
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

```
```txt
$ node testing-4.js 
node:assert:124
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ actual - expected ... Lines skipped

  {
+   id: 1,
-   id: '1',
    name: {
...
      second: 'Clements'
    }
  }
    at Object...
# truncated

```

Assertions like `throws`, `ifError`, and `rejects` are helpful for verifying that errors occur in
synchronous, callback-based, and promise-driven APIs.

Let's start with an error case from an API that is syncrhonous:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-5.js
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

```
```txt
$ node testing-5.js
$ echo $?
0

```

For *callback-based* APIs, `assert.ifError` will succeed if the provided parameter (typically named
`err`) is either `null` or `undefined`:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-6.js
const assert = require('assert')

// This function is an emulation of a URL fetching API
const pseudoReq = (url, cb) => {
    setTimeout(() => {
        if (url == 'http://error.com') cb(Error('network error'))
        else cb(null, Buffer.from('some data'))
    }, 300)
}

pseudoReq('http://example.com', (err, data) => {
    assert.ifError(err)
})

pseudoReq('http://error.com', (err, data) => {
    assert.deepStrictEqual(err, Error('network error'))
})

```
```txt
$ node testing-6.js
$ echo $?          
0

```

Finally let's consider asserting error or success states on a *promise-based* API:
```js
// 16_WRITING_UNIT_TESTS/examples/testing-7.js
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

```
```txt
$ code testing-7.js
$ echo $?          
0

```

## Test harnesses
Test harnesses are tools desinged to facilitate software testing. Individual tests can halt the
process if they fail, potentially missing other crucial assertion results. Test harnesses address
this by grouping assertions, allowing for continous testing even if a subset fails.

Broadly speaking we can group test harnesses in two categories: *pure libraries* vs
*framework environments*:

### Pure Library Test Harnesses
*Pure library* test harnesses offer a module that is imported into a file to organize the tests.
These libraries can be run directly with Node just like regular code, making them easier to debug
and simpler to learn. An example of this is `tap`.

### Framework Environment Test Harnesses
Test *framework environments*, may provide modules but also introduce implicit globals into the
environment and requires another CLI tool to execute tests so that these implicit globals can be
injected. For an example of a test framework environment we'll be looking at `jest`.

Let's define some example APIs to be able to test them using both *pure library* and
*framework environment test harnesses*. Let's create the directory
`16_WRITING_UNIT_TESTS/examples/test-harnesses-tap` and then create inside the following files to be
tested:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/add.js
'use strict'
module.exports = (a, b) => {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw Error('inputs must be numbers')
    }
    return a + b
}

```
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/req.js
'use strict'
module.exports = (url, cb) => {
    setTimeout(() => {
        if (url === 'http://error.com') cb(Error('network error'))
        else cb(null, Buffer.from('some data'))
    }, 300)
}

```
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/req-prom.js
'use strict'
const { setTimeout: timeout } = require('timers/promises')
module.exports = async (url) => {
    await timeout(300)
    if (url === 'http://error.com') throw Error('network error') 
    return Buffer.from('some datas')
}

```

Now let's generate a `package.json` inside of that folder:
```txt
$ npm init -y
Wrote to /node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/package.json:

{
  "name": "test-harnesses-tap",
  "version": "1.0.0",
  "description": "",
  "main": "add.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

```

## `tap` Test Library
Let's install `tap` as a development dependency:
```txt
$ npm i --save-dev tap 

added 324 packages, and audited 325 packages in 19s

62 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

Now we need to create the `test` folder:
```txt
$ node -e "fs.mkdirSync('test')"

```

### `tap` Test Library: add.js
Let's create a test file for `add.js` inside of the `test` folder:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/test/add.test.js
// Destructure the `test` function from the `tap` library for grouping assertions.
const { test } = require('tap')
const add = require('../add.js')

// First test group checks input validation.
// The async function's promise signals the test's completion. When the promise returned by the
// async function resolves, the test is done.
test('throw when inputs are not numbers', async ({ throws }) => {
    // Destructure the `throws` assertion from the passed-in assertions object. In this way we're
    // using tap's own assertions without needing the `assert` module.
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

```

The new test can be run directly with `node`:
```txt
$ node add.test.js 
TAP version 14
# Subtest: throw when inputs are not numbers
    ok 1 - expected to throw
    ok 2 - expected to throw
    ok 3 - expected to throw
    ok 4 - expected to throw
    1..4
ok 1 - throw when inputs are not numbers # time=3.941ms

# Subtest: adds two numbers
    ok 1 - should be equal
    ok 2 - should be equal
    1..2
ok 2 - adds two numbers # time=0.667ms

1..2
# { total: 6, pass: 6 }
# time=13.364ms

```

The output format is known as the *Test Anything Protocol (TAP)*. It is a platform and language 
independent test output format.

When tap is installed, it includes a *test runner* executable which can be accessed locally from
`node_modules/.bin/tap`:
```txt
$ pwd 
/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-tap

$ node_modules/.bin/tap test/add.test.js 
 PASS  test/add.test.js 6 OK 414ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  6 pass  0 fail  6 of 6 complete
Suites:   1 pass  0 fail  1 of 1 complete

# { total: 6, pass: 6 }
# time=466.882ms

```
