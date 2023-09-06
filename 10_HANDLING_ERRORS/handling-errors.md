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
Tipically an *input* error is dealt by using the throw keyword:
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

