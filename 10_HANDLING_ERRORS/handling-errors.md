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
/home/andres/code/andresmunozit/node-js-application-development-lfw211/10_HANDLING_ERRORS/examples/handling-errors-1.js:2
    if (typeof amount !== 'number') throw new Error('amount must be a number')
                                    ^

Error: amount must be a number
    at doTask (/home/andres/code/andresmunozit/node-js-application-development-lfw211/10_HANDLING_ERRORS/examples/handling-errors-1.js:2:43)
    at Object.<anonymous> (/home/andres/code/andresmunozit/node-js-application-development-lfw211/10_HANDLING_ERRORS/examples/handling-errors-1.js:6:1)
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
output the `--trace-uncaught` flag can be used to track the exception however this is not ideal.

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

Native error objects also have a name property that contains the name of the native error
constructor that created it:
```txt
$ node -e 'var err = new TypeError(); console.log(err.name)' 
TypeError
$ node -e 'var err = new Error(); console.log(err.name)'
Error

```

In general, there is only two native errors constructor that are likely to be thrown in developer
code (application or library code), `RangeError` and `TypeError`, for example:
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

```

For more information about native errors see
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Custom Errors
Native errors are limited and can never fit all application needs. We will explore two different
ways (out of several) to communicate error cases: *subclassing* native errors constructors and use a
*code* property. These aren't mutually exclusive.

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
