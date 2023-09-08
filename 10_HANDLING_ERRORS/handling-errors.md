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
`throw` keyword. The `Error` constructor is native to JavaScript, shows a message and automatically
creates a stack trace.

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
ways (out of several) to communicate error cases: *subclassing* native errors constructors and use a
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
        // Calls the parent class (Error) constructor with acustom message.
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
    const result = doTask(3)
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
    // When the input is invalid, `doTask` function will throw so program execution doesn't proceed
    // to the next line but instead jumps to the `catch` block
    const result = doTask(4) // valid input
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
