# Handling Errors
Error handling is a broad and opinionated subject. This chapter will focus solely on creating,
managing and propagating errors in *synchronous*, *promise-based* and *async/await* and *callback*
based scenarios.


## Kinds of Errors
### Operational Errors
Operational Errors occur during a task, like network failures. They should be managed with a fitting
strategy, such as retrying for network issues for instance.

### Developer Errors
Developer Errors result from developer mistakes, like invalid input. The program should stop and
provide a clear error message to guide corrections.


## Throwing
In a Node.js program, when an error is thrown using the throw statement, the normal flow of the
program is interrupted, and the runtime starts looking for a `catch` block to handle the error.
If no `catch` block is found in the current execution stack (call stack), then the program crashes,
and Node.js prints the error stack trace to the console. If a `catch` block is found, the error is
passed to it, and the program continues from there, potentially recovering from the error and
continuing its normal operation.

Tipically an *input* error is dealt by using the `throw` keyword:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-1.js
function doTask(amount) {
    if (typeof amount !== 'number') throw new Error('amount must be a number')
    return amount / 2
}

// Since `doTask` is called with a non-number, the program will crash
doTask('here is some invalid input')

```
```txt
$ node handling-errors-1.js 
/.../handling-errors-1.js:2
    if (typeof amount !== 'number') throw new Error('amount must be a number')
                                    ^

Error: amount must be a number
    at doTask (/.../handling-errors-1.js:2:43)
    at Object.<anonymous> (/.../handling-errors-1.js:6:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47

Node.js v18.15.0

```

When the program crahes, it displays a stack trace from the error object we created using the
`throw` keyword. The `Error` constructor is native to JavaScript. It shows a message and
automatically creates a stack trace.

While it's recommended to throw an object instantiated from `Error` (or a constructor that inherits
from `Error`), it's possible to throw any value:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-2.js
function doTask(amount) {
    if (typeof amount  !== 'number') throw new Error('amount must be a number')

    // THE FOLLOWING IS NOT RECOMMENDED
    if (amount <= 0) throw 'amount must be greater than zero'
    return amount / 2
}

doTask(-1)

```
```txt
$ node handling-errors-2.js 

/.../handling-errors-2.js:5
    if (amount <= 0) throw 'amount must be greater than zero'
                     ^
amount must be greater than zero
(Use `node --trace-uncaught ...` to show where the exception was thrown)

Node.js v18.15.0

```

In this case there is no stack trace because an `Error` object was not thrown. As noted in the
output the `--trace-uncaught` flag can be used to track the exception, however this is not ideal.

## Native Error Constructors
Besides of the native `Error` constructor, there are six other error constructors that inherit from
that `Error` constructor:
- EvalError
- SyntaxError
- RangeError
- ReferenceError
- TypeError
- URIError

These error constructors exist mostly for the use of *native JavaScript API's* and functionality.
For instance, a `ReferenceError` will be automatically thrown by the JavaScript engine when
attempting to refer a non existent reference:
```txt
$ node -p 'thisReferenceDoesNotExist'

node -p 'thisReferenceDoesNotExist'
[eval]:1
thisReferenceDoesNotExist
^

ReferenceError: thisReferenceDoesNotExist is not defined
    at [eval]:1:1
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3

Node.js v18.15.0

```

Like any object, an error can have its instance verified. We will see that the native error
constructors inherit from the `Error` constructor:
```txt
$ node -p 'var err = new SyntaxError(); err instanceof SyntaxError'
true

$ node -p 'var err = new SyntaxError(); err instanceof Error'     
true

$ node -p 'var err = new SyntaxError(); err instanceof EvalError'
false

```

Native error objects also have a `name` property that contains the name of the native error
constructor that created it:
```txt
$ node -e 'var err = new TypeError(); console.log(err.name)' 
TypeError
$ node -e 'var err = new Error(); console.log(err.name)'
Error

```

In general, there is only two native error constructors that are likely to be thrown in developer
code (application or library code), `RangeError` and `TypeError`. For example:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-3.js
function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
}

doTask(-1)

```

```txt
$ node handling-errors-3.js 
/.../10_HANDLING_ERRORS/examples/handling-errors-3.js:3
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
                     ^

RangeError: amount must be greater than zero
    at doTask (/.../handling-errors-3.js:3:28)
...

```

```js
// 10_HANDLING_ERRORS/examples/handling-errors-4.js
function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
}

doTask('here is some invalid input')

```

```txt
$ node handling-errors-4.js
/.../handling-errors-4.js:2
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
                                    ^

TypeError: amount must be a number
    at doTask (/.../handling-errors-4.js:2:43)
...

```

For more information about native errors see
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Custom Errors
Native errors are limited and can never fit all application needs. We will explore two different
ways (out of several) to communicate error cases: *subclassing* native error constructors and use a
*code* property. These aren't mutually exclusive.

### Using a `code` property
Let's create an error and add a `code` property:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-5.js
function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be a number')

    // Let's add a new validation requirement such that `amount` may only contain even numbers
    if (amount % 2) {
        // If amount is not even we'll create an error and add a `code` property
        const err = Error('amount must be even')
        err.code = 'ERR_MUST_BE_EVEN'
        throw err
    }
    return amount / 2
}

doTask(3)

```
```txt
$ node handling-errors-5.js 
/.../handling-errors-5.js:10
        throw err
        ^

Error: amount must be even
...
    at node:internal/main/run_main_module:23:47 {
  code: 'ERR_MUST_BE_EVEN'
}

Node.js v18.15.0

```
When this error occurs it can be identified by the `code` value, and then handled accordingly. Node
APIs generate native errors, either directly from "Error" or its six derivatives, and assign them a
`code` property. In the upcoming section, we'll explore how to detect and classify errors using
their unique `code` values.

### Subclassing Native Error Constructors
We can also inherit from `Error` to create a custom error instance:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-6.js
class OddError extends Error {
    // Constructs an OddError instance with a custom message indicating that the input must be even.
    // For example, invoking `new OddError('amount')` will result in an error message: "amount must
    // be even".
    constructor(varName = '') {
        // Calls the parent class (Error) constructor with a custom message.
        super(varName + ' must be even');
    }
    
    // Defines a `name` property for the error type, setting it to "OddError". Utilizing a getter
    // makes the name non-enumerable, optimizing performance since it's accessed only in error
    // instances.
    get name() { return 'OddError'; }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')

    // Now we throw an `OddError` when amount is not even
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

doTask(3)

```

```txt
$ node handling-errors-6.js
/.../handling-errors-6.js:19
    if (amount % 2) throw new OddError('amount')
                    ^

OddError: amount must be even
    at doTask (/.../handling-errors-6.js:19:27)
...

```

### Using Both Strategies
*Error codes* and *subclassing* native errors, are not mutually exclusive for communicating error
cases:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-7.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

doTask(3)

```

```txt
$ node handling-errors-7.js
/.../handling-errors-7.js:12
    if (amount % 2) throw new OddError('amount')
                    ^

Odd Error [ERR_MUST_BE_EVEN]: amount must be even
    at doTask /.../handling-errors-7.js:12:27
...

```

## Try/Catch
When an error is thrown in a normal synchronous function it can be handled with a try/catch block,
let's apply it to the latest example:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-8.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    // When the input is invalid, `doTask` function will throw so program execution doesn't proceed
    // to the next line but instead jumps to the `catch` block
    const result = doTask(3) // Invalid input
    console.log('result', result)
} catch(err) {
    // Console error only prints an error message in the console, it doesn't deal with the error in
    // any other way
    console.error('Error caugth: ', err)
}

```

```txt
$ node handling-errors-8.js
Error caugth:  Odd Error [ERR_MUST_BE_EVEN]: amount must be even
    at doTask (/.../handling-errors-8.js:12:27)
    at Object.<anonymous> (/.../handling-errors-8.js:17:20)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  code: 'ERR_MUST_BE_EVEN'
}

```

In this case, we controlled how the error was output to the terminal. With this pattern we can apply
any error handling measure as the scenario requires.

Let's update the argument passed to `doTask` to a valid input:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-9.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(4) // Valid input
    console.log('result', result)
} catch(err) {
    console.error('Error caugth: ', err)
}

```

```txt
$ node handling-errors-9.js
result 2

```

Rather than just logging the error, we can determine what kind of error has occurred and handle it
accordingly:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-10.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(3) // 1st execution
    // const result = doTask('here is some invalid input') // 2st execution
    // const result = doTask(-1) // 3rd execution

    console.log('result', result)
} catch(err) {
    if (err instanceof TypeError) {
        console.log('wrong type')
    } else if (err instanceof RangeError) {
        console.log('out of range')
    } else if (err instanceof OddError) {
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}

```

```txt
$ node handling-errors-10.js 
cannot be odd

$ node handling-errors-10.js
wrong type

$ node handling-errors-10.js
out of range

```

However, checking the instance of an error is flawed, specially when checking against native
constructors. Check the following change to the code:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-11.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(4) // Now we use an even input
    
    // The returned value is a number, not a function so the following call will result in an error
    // object which, is an instance of `TypeError`
    result()
    console.log('result', result)
} catch(err) {
    if (err instanceof TypeError) {
        console.log('wrong type') // So the output will be "wrong type"
    } else if (err instanceof RangeError) {
        console.log('out of range')
     // In this case, we test the `code` instead of using the `instanceof` keyword
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}

```
```txt
$ node handling-errors-11.js 
wrong type

```

To mitigate this is better to use *duck-typing* in JavaScript. This means looking for certain
qualities to determine what an object is - e.g. if it looks like a duck, and quacks like a duck it's
a duck. To apply duck-typing in error handling, we can follow what Node core APIs do and use a
`code` property:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-12.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

// Let's create a small utility function for adding a code to an error object
function codify(err, code) {
    err.code = code
    return err
}


// Now let's add a code to the `TypeError` and the `RangeError` objects
function doTask(amount) {
    if (typeof amount !== 'number') throw codify(
        new TypeError('amount must be a number'),
        'ERR_AMOUNT_MUST_BE_NUMBER'
    )
    if (amount <= 0) throw codify(
        new RangeError('amount must be greater than zero'),
        'ERR_AMOUNT_MUST_EXCEED_ZERO'
    )
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(4)
    result()
    console.log('result', result)
// Now we can update the catch block to check the code propery instead of using an instance check:
} catch(err) {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
        console.log('wrong type')
    } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
        console.log('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}

```

Now erroneously calling `result` as a function will cause the error checks to reach the final `else`
branch in the `catch` block:
```txt
$ node handling-errors-12.js 
Unknown error TypeError: result is not a function
    at Object.<anonymous> (/.../handling-errors-12.js:32:5)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47

```

## Rejections
In Chapter 8, we studied various asynchronous syntax and patterns including callback patterns,
Promise abstractions, and async/await syntax. We mainly focused on errors in synchronous code, where
"throw" indicates an exception, representing a synchronous error. Conversely, a promise rejection
represents an asynchronous error. Essentially, *exceptions are for synchronous* errors while
*rejections handle asynchronous errors*.

Let's modify `doTask` to perform asynchronous work using a callback or promise-based API, including
async/await, and have it return a promise that either resolves to a value or rejects due to an
error:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-13.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    // The returned promise is created using the `Promise` constructor.
    // The function passed to `Promise` is called the *tether* function, it takes two arguments,
    // `resolve` and `reject` which are also functions.
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            // We call `reject` when the operation is a failure
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount >= 0) {
            // We're passing an error into `reject` for each of our error cases so that the returned
            // promise will reject when `doTask` is passed an invalid input.
            reject(new RangeError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        // We call `resolve` when the operation is a success
        resolve(amount / 2)
    })
}

// Calling doTask with an invalid input, as in the above, will result in an unhandled rejection
doTask(3)

```

```txt
$ node handling-errors-13.js
/.../handling-errors-13.js:24
            reject(new OddError('amount'))
                   ^

Odd Error [ERR_MUST_BE_EVEN]: amount must be even
    at /.../handling-errors-13.js:24:20
    at new Promise (<anonymous>)
    at doTask (/.../handling-errors-13.js:13:12)
    at Object.<anonymous> (/.../handling-errors-13.js:33:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  code: 'ERR_MUST_BE_EVEN'
}

Node.js v18.15.0

```

The rejection is unhandled because promises must use the `catch` method to catch rejections and so
far we haven't attached a catch handler. Let's modify the `doTask` call to the following:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-14.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount <= 0) {
            reject(new RangeError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        resolve(amount / 2)
    })
}

doTask(3) // We use an odd amount
    // We add a `then` handler that will handle success
    .then((result) => {
        console.log('result', result)
    })
    // We add a `then` handler that will handle rejection
    .catch((err) => {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            console.error('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            console.error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    })

```

Now this functionality is equivalent to the synchonous non-promise based from of our code, the
errors are handled in the same way:
```txt
$ node handling-errors-14.js
cannot be odd

# Now we call `doTask` with 4, in this case the function execution is successful so the `then`
# handler is invoked
$ node handling-errors-14.js
result 2

```

If you use `throw` inside a promise handler, it creates a rejection, not an exception. Then, the
`then` or `catch` handlers generate a new promise that also rejects due to the `throw` in the
handler.

Lets `throw` inside the then handler:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-15.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount <= 0) {
            reject(new RangeError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        resolve(amount / 2)
    })
}

doTask(4) // Note that this time we use a valid input
    .then((result) => {
        throw Error('spanner in the works')
    })
    .catch((err) => {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            console.error('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            console.error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    })

```

```txt
$ node handling-errors-15.js
Unknown error Error: spanner in the works
    at /.../handling-errors-15.js:27:15

```

Even though `doTask(4)` does not cause a promise rejection, the `throw` in the `then` handler does.
So the `catch` handler on the promise returned from `then` will reach the final else branch and
output unknown error.

Remember, since functions can call other functions, a `throw` in any function in the call stack that
starts in a `then` handler will create a rejection, not the usual exception.

## Async Try/Catch
We can use `try/catch` on asynchronous promise-based APIs instead of using `then` and `catch`
handlers. 

Let's create an async function named `run` and reintroduce the same `try/catch` pattern that was
used when calling the synchronous form of `doTask()`:
```js
// 10_HANDLING_ERRORS/examples/handling-errors-16.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount <= 0) {
            reject(new RangeError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        resolve(amount / 2)
    })
}

async function run() {
    // We wrapped the try/catch block in an async function
    try {
        // This time we await `doTask(3)`, so the async function will handle the promise.
        // Since 3 is an odd number, the promise returned from `doTask(3)`, will call `reject` with
        // our custom `OddError`.
        const result = await doTask(3)
        console.log('result', result)
    } catch(err) {
        if (err instanceof TypeError) {
            console.error('wrong type')
        } else if (err instanceof RangeError) {
            console.error('out of range')
        // The `catch` block will identify the `code` property and then output "can not be odd"
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    }
}

run()

```

```txt
$ node handling-errors-16.js
cannot be odd

```

Using `try/catch` within an async function to handle awaited promises is *syntactic sugar*. The
`catch` block in the async function `run` is the equivalent of the `catch` method chained to an
async function call, for example `asyncFunc().then().catch(...)`.

An async function always returns a promise that resolves to the returned value, unless a `throw`
occurs in that async function, in which case the returned promise rejects. That makes possible that
instead of returning a promise where we explicitly call `reject`, we can simply `throw`.
```js
// 10_HANDLING_ERRORS/examples/handling-errors-17.js
class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

// This allows the possibility of doTask to perform asynchronous tasks
async function doTask(amount) {
    // Instead of returning a promise in which we explicitly call `reject`, we throw right after
    // each error
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

async function run() {
    try {
        // When an error is thrown the program is interrupted and the runtime starts looking for a
        // catch block to handle the error.
        const result = await doTask(3) // Invalid input
        console.log('result', result)
    } catch(err) {
        if (err instanceof TypeError) {
            console.error('wrong type')
        } else if (err instanceof RangeError) {
            console.error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    }

    // In case that a `catch` block was not found in the current execution stack, then the program
    // crashes, and Node.js prints the error stack trace to the console
}

run()

```

```txt
$ node handling-errors-17.js
cannot be odd

```

All the errors we've been creating and handling are develeloper errors, but in an asynchronous
context we're most likely to encounter operational errors. For example imagine an HTTP request that
fails for some reason, that's an asynchronous operational error. We can handle the operational
errors in the same way as developer errors, that means we can await the asynchronous operation and
then catch any operational errors as well.

For example:
```js
// Pseudocode
async function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    // The `asyncFetchResult` imaginary function makes an HTTP request. If the operartion is
    // successful the promise returned from `asyncFetchResult` resolves to a valid value, if it's
    // not for any reason (network error, service error, etc.), then the promise will reject.
    const result = await asyncFetchResult(amount)
    return result
} 

```

In the case where the promise returned from `asyncFetchResult` rejects, it will cause the
promise returned from `doTask` to reject. This will trigger the `catch` block in the `run` async
function. Note that the catch block could be extended to handle that operational error.

## Propagation
Error Propagation is a concept where a function, instead of handling an error itself, lets the
caller deal with it. Take, for example, the `doTask` function that might produce an error. Another
function, `run`, calls `doTask` and manages this potential error. If `doTask` encounters an unexpected
error, it's "propagated" to be addressed by the `run` function.

The following is a full implementation of our code in async/await form with `run` *handling* known
errors but *propagating* unknown errors.
```js
// 10_HANDLING_ERRORS/examples/handling-errors-18.js
class OddError extends  Error  {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() {
        return 'OddError [' + this.code + ']'
    }
}

function codify(err, code) {
    err.code = code
    return err
}

async function doTask(amount) {
    if (typeof amount !== 'number') throw codify(
        new TypeError('amount must  be a number'),
        'ERR_AMOUNT_MUST_BE_NUMBER'
    )
    if (amount <= 0) throw codify(
        new RangeError('amount must be greater than zero'),
        'ERR_AMOUNT_MUST_EXCEED_ZERO'
    )
    if (amount %2) throw OddError('amount')
    // For purposes of explanation the `doTask` function unconditionally throws an error when input
    // is valid so that we show the error propagation
    throw Error('some other error')
    return amount / 2
}

async function run() {
    try {
        const result = await doTask(4)
        console.log(result)
    } catch (err) {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            console.log('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            console.log('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.log('cannot be odd')
        } else {
            // The error doesn't correspond to any of the known errors and so instead of logging it
            // out, it is rethrown
            throw err
        }
    }
}

// This causes the promise returned by the run async function to reject, thus triggering the catch
// handler which is attached to it
run().catch((err) => { console.log('Error caugth', err) })

```
```txt
$ node handling-errors-18.js 
Error caugth Error: some other error
    at doTask (/.../handling-errors-18.js:28:11)
    at run (/.../handling-errors-18.js:34:30)
    at Object.<anonymous> (/.../handling-errors-18.js:53:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47

```

Error propagation works similarly in synchronous code, both in structure and syntax. We can convert
`doTask` and run into non-async functions by removing the async keyword:
```js

```