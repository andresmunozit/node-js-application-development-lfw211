# Writing Unit Tests
Testing is essential for any developer. An untested application isn't production-ready. In this
final chapter, we'll explore techniques for testing various API designs.

## Assertions
Assertions validate *values against conditions*, throwing errors if unmet. They're central to unit
and integration testing. 

The *core* `assert` module throws an `AssertionError` if the given value is falsy (convertible to
`false` using `!!val`). If the value passed to `assert` is truthy then it will not throw:
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
    at Object.<anonymous> (/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/testing-4.js:8:15)
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
    // Won't throw since `err` is null
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

### `tap` Test Library: req.js
Code coverage shows which paths in the code were executed. It boosts confidence in tested code,
especially in languages like JavaScript where varied input types matter. However, high code coverage
does't guarantee comprehensive testing since it differs from *case coverage*.

Let's test the *callback-based* API:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/test/req.test.js
'use strict'
// We'll use the `test` function to group assertions for different scenarios
const { test } = require('tap')
const req = require('../req')

// In the first group we're testing our mock network error scenario
// Since we're testing a callback-based API, we don't provide an async function to `test`, it's much
// easier to call a final callback to signal test completion, in this case it's the `end` function.
test('handles network error', ({ same, end }) => {
    req('http://error.com', (err, data) => {
        // `same` works the same as `deepStrictEqual`. We use it in both groups to check
        // the expected error and the expected buffer respectivelly.
        same(err, Error('network error'))
        // `tap` requires an explicit `end()` due to unpredictable asynchronous ops and to avoid
        // premature test completion, ensuring all assertions are executed.
        end()
    })
})

// In the second group we're testing our mock output
test('responds with data', ({ ok, same, error, end}) => {
    req('http://example.com', (err, data) => {
        // Since we're not expecting an error, `error` is not expected to throw.
        error(err)
        // The `ok` assertion checks for truthiness. `Buffer.isBuffer(data)` will return a boolean.
        ok(Buffer.isBuffer(data))
        
        // Since buffers are array-like, deep equality check will loop through every element in the
        // array and check them against each other.
        same(data, Buffer.from('some data'))
        // We use `end()` in both groups to avoid test timeouts and ensure assertions run before a
        // test group completes
        end()
    })
})

```

Let's run all the tests using the `tap` *test runner*:
```txt
$ ./node_modules/.bin/tap
 PASS  test/add.test.js 6 OK 363ms
 PASS  test/req.test.js 4 OK 960ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  10 pass  0 fail  10 of 10 complete
Suites:    2 pass  0 fail    2 of 2 complete

# { total: 10, pass: 10 }
# time=1023.354ms

```

Now let's test the `req-prom.js` file:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-tap/test/req-prom.test.js
'use strict'
const { test } = require('tap')
const req = require('../req-prom')

// Using async functions due to promises.
test('handles network errors', async ({ rejects }) => {
    // Using `rejects` assertion to check error passed. Await it since it returns a promise.
    await rejects(req('http://error.com'), Error('network error'))
})

test('responds with data', async ({ ok, same }) => {
    // If `req` rejects, it will be caught by the async function leading to an assertion failure.
    const data = await req('http://example.com')
    ok(Buffer.isBuffer(data))
    same(data, Buffer.from('some data'))
})

```

Let's run all the tests using the `tap` *test runner*:
```txt
$ ./node_modules/.bin/tap
 PASS  test/add.test.js 6 OK 392ms
 PASS  test/req.test.js 4 OK 986ms
 PASS  test/req-prom.test.js 3 OK 998ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  13 pass  0 fail  13 of 13 complete
Suites:    3 pass  0 fail    3 of 3 complete

# { total: 13, pass: 13 }
# time=1067.335ms

```

## `jest` Framework: test/add.test.js
Let's set up the `16_WRITING_UNIT_TESTS/examples/test-harnesses-jest`, folder for writing test with
jest:
```txt
$ node -e "fs.mkdirSync('test-harnesses-jest')"
$ cp test-harnesses-tap/*.js test-harnesses-jest 
$ cd test-harnesses-jest 
$ ll
total 12K
-rw-rw-r-- 1 andres andres 171 nov  3 23:15 add.js
-rw-rw-r-- 1 andres andres 197 nov  3 23:15 req.js
-rw-rw-r-- 1 andres andres 233 nov  3 23:15 req-prom.js

$ npm init -y
Wrote to /node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/package.json:
# Truncated

$ npm install --save-dev jest

added 290 packages, and audited 291 packages in 50s

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

$ node -e "fs.mkdirSync('test')"

```

Now let's create a test file for `add.js`:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/test/add.test.js
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

```

We cannot run the test directly with node, since we wouldn't have access to the `test` and `expect`
functions:
```txt
$ node add.test.js 
/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/test/add.test.js:6
test('throw when inputs are not numbers', async () => {
^

ReferenceError: test is not defined
    at Object.<anonymous> (/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/test/add.test.js:6:1)
# Truncated

```

Instead we always have to use the `jest` executable to run tests:
```txt
$ pwd
/node-js-application-development-lfw211/16_WRITING_UNIT_TESTS/examples/test-harnesses-jest

$ node_modules/.bin/jest test/add.test.js 
 PASS  test/add.test.js
  ✓ throw when inputs are not numbers (3 ms)
  ✓ adds two numbers

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.198 s
Ran all test suites matching /test\/add.test.js/i.

```

But default `jest` does not output code coverage but can be passed the `--coverage` flag to do so:
```txt
$ node_modules/.bin/jest --coverage test/add.test.js
 PASS  test/add.test.js
  ✓ throw when inputs are not numbers (5 ms)
  ✓ adds two numbers

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 add.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.215 s, estimated 1 s
Ran all test suites matching /test\/add.test.js/i.

```

> Note that direct Node execution of tests simplifies debugging by removing intermediaries.

## `jest` Framework: test/req.test.js
Let's create a test file for `req.js`:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/test/req.test.js
'use strict'
const req = require('../req')

test('handles network error', (done) => {
    req('http://error.com', (err, data) => {
        expect(err).toStrictEqual(Error('network error'))
        // In this callback-based, we call `done` to signal the end of this test case.
        done()
    })
})

test('responds with data', (done) => {
    req('http://example.com', (err, data) => {
        // `expect` doesn't have an equivalent to `ifError`. Using a coercive equality check will
        // result in the conditional being true if error is `null` or `undefined`
        expect(err == null).toBe(true)
        // `isBuffer` will return a boolean. We use `toBeTruthy` here to demonstrate how to achieve
        // the same behavior as `ok`
        expect(Buffer.isBuffer(data)).toBeTruthy()
        expect(data).toStrictEqual(Buffer.from('some data'))
        done()
    })
})

```

Let's check our test with `jest`:
```txt
$ node_modules/.bin/jest test/req.test.js
 PASS  test/req.test.js
  ✓ handles network error (307 ms)
  ✓ responds with data (307 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.801 s, estimated 6 s
Ran all test suites matching /test\/req.test.js/i.

```

## `jest` Framework: test/req-prom.test.js
Finally, let's create a test file for `req-prom.js`:
```js
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/test/req-prom.test.js
'use strict'
const req = require('../req-prom')

test('handles network error', async () => {
    // Here we use `await` because `rejects` returns a promise
    await expect(req('http://error.com'))
        .rejects
        .toStrictEqual(Error('network error'))
})

test('responds with data', async () => {
    // If `req` rejects, it will be caught by the async function leading to an assertion failure.
    const data = await req('http://example.com')
    expect(Buffer.isBuffer(data)).toBeTruthy()    
    expect(data).toStrictEqual(Buffer.from('some data'))
})

```

With all tests now completed, executing `jest` without specifying file names will result in all test
files within the `test` folder being automatically processed by `jest`:
```txt
$ node_modules/.bin/jest                            
 PASS  test/req-prom.test.js
 PASS  test/req.test.js
 PASS  test/add.test.js

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.525 s
Ran all test suites.

```


## Configuring `package.json`
One final step that is critical, is to confirm that the test script in `package.json` executes the
correct command. This is a very common mistake, so bear this in mind.

In a fresh `package.json` file, the default `test` script returns an exit code of 1, indicating a
failure:
```json
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/package.json
{
  "name": "test-harnesses-jest",
  "version": "1.0.0",
  "description": "",
  "main": "add.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jest": "^29.7.0"
  }
}

```

This implies that the absence of tests is treated as a failing test condition:
```txt
$ npm test

> test-harnesses-jest@1.0.0 test
> echo "Error: no test specified" && exit 1

Error: no test specified

```

The `scripts` section in `package.json` should contain *shell commands*. These commands can
directly invoke `jest`, `tap` or any other executable within `node_modules/.bin` directory, as the
runtime environment automatically checks this folder for such executables.

Let's modify the `test` script to execute `jest` and output the test coverage:
```json
// 16_WRITING_UNIT_TESTS/examples/test-harnesses-jest/package.json
{
  "name": "test-harnesses-jest",
  "version": "1.0.0",
  "description": "",
  "main": "add.js",
  "scripts": {
    "test": "jest --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jest": "^29.7.0"
  }
}

```

Now let's run `npm test`:
```txt
$ npm test

> test-harnesses-jest@1.0.0 test
> jest --coverage

 PASS  test/req-prom.test.js
 PASS  test/req.test.js
 PASS  test/add.test.js
-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |     100 |      100 |     100 |     100 |                   
 add.js      |     100 |      100 |     100 |     100 |                   
 req-prom.js |     100 |      100 |     100 |     100 |                   
 req.js      |     100 |      100 |     100 |     100 |                   
-------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.546 s
Ran all test suites.

```

## Labs

## Lab 16.1 - Test a Sync API
The `labs-1` folder contains a `package.json` file and a `uppercase.js` file.

The `package.json` file contains the following:
```js
// labs-june-2023/labs/ch-16/labs-1/package.json
{
    "name": "labs-1",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "UNLICENSED"
}

```

The `uppercase.js` file contains the following:
```js
// labs-june-2023/labs/ch-16/labs-1/uppercase.js
'use strict'
function uppercase(str) {
    if (typeof str !== 'string') throw Error('input must be a string')
    return str.toUpperCase()
}

module.exports = uppercase

```

Write tests for the `uppercase.js` file. Ensure that when `npm test` is executed with the `labs-1`
folder as the current working directory the `uppercase.js` file is fully tested.

Any additional dependencies, such as a test harness, may be additionally installed.

Also in the `labs-1` folder is a `validate.js` file. The implementation can be checked with node
`validate.js`. The implementation is successful if the final output of `node validate.js` is
passed!.

#### Solution
```txt
$ npm install -D tap

```
```js
// 16_WRITING_UNIT_TESTS/labs/labs-1/test/uppercase.test.js
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

```
```json
// 16_WRITING_UNIT_TESTS/labs/labs-1/package.json
{
    "name": "labs-1",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        // The test script runs tap
        "test": "tap"
    },
    "keywords": [],
    "author": "",
    "license": "UNLICENSED",
    "devDependencies": {
        "tap": "^18.5.7"
    }
}

```
```txt
$ npm test -- test/uppercase.test.js

> labs-1@1.0.0 test
> tap test/uppercase.test.js

 PASS  test/uppercase.test.js 6 OK 343ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  6 pass  0 fail  6 of 6 complete
Suites:   1 pass  0 fail  1 of 1 complete

# { total: 6, pass: 6 }
# time=393.067ms

$ node validate.js                  
passed!

```

### Lab 16.2 - Test a Callback-Based API
The `labs-2` folder contains a `package.json` file and a `store.js` file.

The `package.json` file contains the following.
```json
// 16_WRITING_UNIT_TESTS/labs/labs-2/package.json
{
  "name": "labs-2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "UNLICENSED"
}

```

The `store.js` file contains the following:
```js
// labs-june-2023/labs/ch-16/labs-2/store.js
'use strict'
module.exports = (value, cb) => {
    if (Buffer.isBuffer(value) === false) {
        cb(Error('input must be a buffer'))
        return
    }
    setTimeout(() => {
        const id = Math.random().toString(36).split('.')[1].slice(0, 4)
        cb(null, { id })
    }, 300)
}

```

This API mimics some kind of async storage mechanism, such as to a database. In some circumstances
it is infeasible to check for a specific value (for instance an ID returned from a
database). For those cases, we can check for the presence of an ID, or apply some validation.
In our case we can at least check that the length of the ID is 4.

Write tests for the `store.js` file. Ensure that when npm test is executed with the `labs-2`
folder as the current working directory the `store.js` file is fully tested.

Any additional dependencies, such as a test harness, may be additionally installed.
Also in the `labs-2` folder is a `validate.js` file. The implementation can be checked with node
validate.js. The implementation is successful if the final output of node `validate.js` is
passed!

#### Solution
```json
// 16_WRITING_UNIT_TESTS/labs/labs-2/package.json
{
  "name": "labs-2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "tap"
  },
  "keywords": [],
  "author": "",
  "license": "UNLICENSED",
  "devDependencies": {
    "tap": "^18.5.7"
  }
}

```
```js
// 16_WRITING_UNIT_TESTS/labs/labs-2/test/store.test.js
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

```
```txt
$ npm test

> labs-2@1.0.0 test
> tap

 PASS  test/store.test.js 5 OK 658ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  5 pass  0 fail  5 of 5 complete
Suites:   1 pass  0 fail  1 of 1 complete

# { total: 5, pass: 5 }
# time=713.708ms

$ node validate.js 
passed!

```

### Lab 16.3 - Test a Promise-Based async/await API
The `labs-3` folder contains a `package.json` file and a `store.js` file.

The `package.json` file contains the following:
```json
// 16_WRITING_UNIT_TESTS/labs/labs-3/package.json
{
  "name": "labs-3",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "UNLICENSED"
}

```

The `store.js` file contains the following:
```js
// 16_WRITING_UNIT_TESTS/labs/labs-3/store.js
'use strict'
const { promisify } = require('util')
const timeout = promisify(setTimeout)
module.exports = async (value) => {
    if (Buffer.isBuffer(value) === false) {
        throw Error('input must be a buffer')
    }
    await timeout(300)
    const id = Math.random().toString(36).split('.')[1].slice(0, 4)
    return { id }
}

```

This API mimics some kind of async storage mechanism, such as to a database. In some
circumstances it is infeasible to check for a specific value (for instance an ID returned from a
database). For those cases, we can check for the presence of an ID, or apply some validation.
In our case we can at least check that the length of the ID is 4.

Write tests for the `store.js` file. Ensure that when npm test is executed with the `labs-2`
folder as the current working directory the `store.js` file is fully tested.

Any additional dependencies, such as a test harness, may be additionally installed.

Also in the `labs-3` folder is a `validate.js` file. The implementation can be checked with node
`validate.js`. The implementation is successful if the final output of node `validate.js` is
passed!

#### Solution
```json
// 16_WRITING_UNIT_TESTS/labs/labs-3/package.json
{
  "name": "labs-3",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "tap"
  },
  "keywords": [],
  "author": "",
  "license": "UNLICENSED",
  "devDependencies": {
    "tap": "^18.5.7"
  }
}

```
```js
// 16_WRITING_UNIT_TESTS/labs/labs-3/test/store.test.js
const { test } = require('tap')
const store = require('../store')

test('handles wrong input', async ({ rejects }) => {
    await rejects(store('wrong input'))
})

test('returns an id', async ({ same, ok }) => {
    const { id } = await store(Buffer.from('test'))
    same(id.length, 4)
})

```
```txt
$ npm test

> labs-3@1.0.0 test
> tap

 PASS  test/store.test.js 2 OK 685ms

                       
  🌈 TEST COMPLETE 🌈  
                       

Asserts:  2 pass  0 fail  2 of 2 complete
Suites:   1 pass  0 fail  1 of 1 complete

# { total: 2, pass: 2 }
# time=743.422ms

$ node validate.js  
passed!

```

## Knowledge Check

### Question 16.1
Using the Node core `assert` module and given the expression `assert.equal('1', 1)` what will be the
outcome?
- A. Nothing, the assertion will pass [x]
- B. An assertion error will throw because of incompatible types
- C. A warning will be printed

### Question 16.2
Which is a major difference between pure library test harnesses (like `tap`) and framework
environment test harnesses (like jest)?
- A. Both can be run directly with Node but only framework environment test harnesses have a test
runner
- B. Pure library test harnesses have programmatic APIs whereas framework environment test harnesses
have implicit APIs [x]
- C. Pure library test harnesses are smaller whereas framework environment test harnesses are more
comprehensive

### Question 16.3
Why is code coverage important?
A. It isn't important
B. Ensuring high test coverage can help tease out bugs by covering as many logic paths as possible,
this is especially important in a loosely typed language [x]
C. Bragging rights
