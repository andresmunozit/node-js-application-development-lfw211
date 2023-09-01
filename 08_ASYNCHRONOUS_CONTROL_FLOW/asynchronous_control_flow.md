# Asynchronous Control Flow
Node.js allows JavaScript to run server-side and is built on its event-driven nature. This means
tasks, like those scheduled with `setTimeout`, don't always run sequentially. While waiting for a
task, other operations can run. This asynchronous approach is common in Node.js for Input/Output
operations. We'll explore control flow patterns in Node.js, covering both serial and parallel
execution of asynchronous tasks.

## Callbacks
A callback is a function that will be called at some future point, once a task has been completed.
Let's take a look at an example `readFile` call:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks.js
// This program  will read its own source code and print it out
const { readFile } = require('fs')

// `_filename` in Node.js holds the path of the file currently being executed
// When the file has been read, the `readFile` function will call the function provided as the
// second argument
readFile(__filename, (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
})

```

```txt
$ node callbacks.js 
// This program  will read its own source code and print it out
const { readFile } = require('fs')

// `_filename` in Node.js holds the path of the file currently being executed
// When the file has been read, the `readFile` function will call the function provided as the
// second argument
readFile(__filename, (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
})

```

> Always having an error as the first parameter is convention in Node, this type of error-first
callback is known as an *Errback*

Imagine a program with three variables, `smallFile`, `mediumFile`, `bigFile` each which holds the
path of a file of a greater size than the last. If we want to log out the contents of each file
based on the chronological order in that file has been loaded, we can do something like the
following:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-2.js
const  { readFile }  =  require('fs')

// `smallFile`, `mediumFile`, and `bigFile` are mocked and they're actually all the current file
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

readFile(bigFile, print)
readFile(mediumFile, print)
readFile(smallFile, print)

```

If the files were genuinely different sizes, the above would print out the contents of `smallFile`
first and `bigFile` last even though the `readFile` operation for `bigFile` was called first.
This is one way to achieve **parallel execution** in Node.js.

If we want to use **serial execution** (read the files in order, independent of its size):
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-3.js
const { readFiles } = require('fs')

// Array.from() static method creates a new, shallow-copied Array instance from an iterable or
// array-like object
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

// Serial execution with callbacks is achieved by waiting for the callback to call before starting
// the next asynchronous operation
readFile(bigFile, (err, contents) => {
    print(err, contents)
    readFile(mediumFile, (err, contents) => {
        print(err, contents)
        readFile(smallFile, print)
    })
})

```

If we want to concatenate and log the contents of all files once they're all loaded, the following
example adds each file's contents to an array and logs it when all files are loaded.
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-4.js
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFille ] = Array.from(Array(3)).fill(__filename)
const data = []
const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

readFile(bigFile, (err, contents) => {
    if (err) print(err)
    else data.push(contents)
    readFile(mediumFile, (err, contents) => {
        if (err) print(err)
        else data.push(contents)
        readFile(mediumFile, (err, contents) => {
            if (err) print(err)
            else data.push(contents)
            // The use of `Buffer.concat` here takes the three buffer objects in the data array and
            // concatenates them together
            print(null, Buffer.concat(data))
        }) 
    })
})

```

So far we've used three asynchronous operations, but how would an unknown amount of asynchronous
operations be supported?

In the following example, the goal is to print all the files contents out in the order they appear
in the array:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-5.js
const { readFile } = require('fs')

// The files array is only a mock, The idea is that files array could be any length
const files = Array.from(Array(3)).fill(__filename)
const data = []
const print = (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}

// self-recursive function, `read`, is created along with two variables, `count` and `index`.
// `count`: amount of files to read
// `index`: represent the `index` in the array of files
let count = files.length
let index = 0
const read = (file) => {
  readFile(file, (err, contents) => {
    index += 1
    if (err) print(err)
    else data.push(contents)
    // Once a file has been read and added to the data array, read is called again if index < count
    if (index < count) read(files[index])
    else print(null, Buffer.concat(data)) // Otherwise the data array is concatenated and printed out
  })
}

read(files[index])

```

Callback-based serial execution can become quite complicated, let's use the `fastseries` package to
implement the same serial execution:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-fastseries/callbacks.js
const { readFile } = require('fs')
const series = require('fastseries')()

const files = Array.from(Array(3)).fill(__filename)

// Define a function to handle the result of reading all files, `data` will contain an array of
// results
const print  = (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(Buffer.concat(data).toString())
}

// Mapping the `files` array into an array of functions for `fastseries` to process
const readers = files.map((file) => {
  // The mapped functions have two parameters, `cb` is the callback function which we must call to
  // let `fastseries` know that an asynchronous operation has finished, so that it can continue to
  // processing the next function in the `readers` array
  return (_, cb) => { // `_` is a placeholder since the first parameter is not used
    readFile(file, (err, contents) => {
      if (err) cb(err) // Pass error to callback if there's an error
      else cb(null, contents) // Pass file contents to callback if read is successful
    })
  }
})

// Execute the array of functions (readers) serially, then call the 'print' callback at the end
series(null, readers, null, print)

```

If an error occurs, it's passed  to the `cb` function and `fastseries` will call `print` with error
and then end. To be able to call `print` with an error but continue to read any other files in the
array (as the previous examples) change the readers array to the following:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/callbacks/callbacks-fastseries-2/callbacks.js
const { readFile } = require('fs')
const series = require('fastseries')()

const files = Array.from(Array(3)).fill(__filename)

const print  = (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(Buffer.concat(data).toString())
}

const readers = files.map((file) => {
  return (_, cb) => {
    readFile(file, (err, contents) => {
      // if (err) cb(err)
      // Instead of calling `cb` with an error, log the error and return a new empty `Buffer`
      if (err) {
        print(err)
        cb(null, Buffer.alloc(0))
      }
      else cb(null, contents)
    })
  }
})

series(null, readers, null, print)

```

## Promises
A promise is an object that represents an asynchronous operation. It's either pending or settled,
and if it is settled is either resolved or rejected. Treating an asynchronous operation as an
object is a very useful abstraction, instead of passing a callback function that will be called when
the asynchronous operation has finished, we can return a promise from a function instead.

Let's consider the callback-based approach:
```js
// Pseudocode: callback approach
function myAsyncOperation (cb) {
  doSomethingAsynchronous((err, value) => { cb(err, value) })
}

myAsyncOperation(functionThatHandlesTheResult)

```

Now let's consider the same using the promise approach:
```js
// Pseudocode: promise approach
function myAsyncOperation () {
  // The function passed to the Promise constructor is called the `executor` function
  return new Promise((resolve, reject) => {
    doSomethingAsynchronous((err, value) => {
      if (err) reject(err)
      else resolve(value)
    })
  })
}

const promise = myAsyncOperation()
// next up: do something with promise

```

In Node there is a nicer way to do this with the `promisify` function from the `util` module:
```js
// Pseudocode: promisify
const { promisify } = require('util')
const doSomething = promisify(doSomethingAsynchronous)
function myAsyncOperation() {
  return doSomething()
}

const promise = myAsyncOperation()
// next up: do something with promise

```

The best way to handle promises is `async/await`, which will be discussed later. However, the
methods to handle promise success or failure are `then` and `catch`:
```js
// Pseudocode: `then`, `catch`
const promise = myAsyncOperation()

// `then` and `catch` always return a promise so they can be chained
promise
  .then((value) => { console.log(value)})
  .catch((err) => { console.error(err) })

```

Let's see a more concrete example:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises.js
const { promisify} = require('util')
const { readFile } = require('fs')

const readFileProm = promisify(readFile)
const promise = readFileProm(__filename)

promise.then((contents) => {
    console.log(contents.toString())
})

promise.catch((err) => {
    console.error(err)
})

```

```txt
$ node ./promises.js
const { promisify} = require('util')
const { readFile } = require('fs')

const readFileProm = promisify(readFile)
const promise = readFileProm(__filename)

promise.then((contents) => {
    console.log(contents.toString())
})

promise.catch((err) => {
    console.error(err)
})

```

When it comes to the `fs` module we don't actually have to use `promisify`, since it exports a
promises object, with promised-based versions. The previous code would look like this:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-2.js
const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        console.log(contents.toString())
    })
    .catch(console.error)
    // We pass `console.error` directly to catch instead of using an intermediate function

```

```txt
$ node ./promises-2.js
const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        console.log(contents.toString())
    })
    .catch(console.error)
    // We pass `console.error` directly to catch instead of using an intermediate function

```

If a value is returned from `then`, the `then` method returns a promise that resolves to that
value:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-3.js
const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        return contents.toString()
    })
    .then((stringifiedContents) => {
        console.log(stringifiedContents)
    })
    .catch(console.error)

```

```txt
$ node ./promises-3.js 
const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        return contents.toString()
    })
    .then((stringifiedContents) => {
        console.log(stringifiedContents)
    })
    .catch(console.error)

```

Even though an intermediate promise is created by the first `then`, we still only need the one
`catch` handler as rejections are propagated.

If a promise is returned from  a `then` handler, the `then` method returns promise, this allows for
an easy serial execution:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-4.js
const { readFile } = require('fs').promises
const [ bigFile,  mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile)
    .then((contents) => {
        print(contents)
        return readFile(mediumFile) // The `then` method returns a promise
    })
    .then((contents) => {
        print(contents)
        return readFile(smallFile)
    })
    .then(print)
    .catch(console.error)

```

```txt
$ node promises-4.js
const { readFile } = require('fs').promises
const [ bigFile,  mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile)
    .then((contents) => {
        print(contents)
        return readFile(mediumFile) // The `then` method return a promise
    })
    .then((contents) => {
        print(contents)
        return readFile(smallFile)
    })
    .then(print)
    .catch(console.error)
const { readFile } = require('fs').promises
const [ bigFile,  mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile)
    .then((contents) => {
        print(contents)
        return readFile(mediumFile) // The `then` method return a promise
    })
    .then((contents) => {
        print(contents)
        return readFile(smallFile)
    })
    .then(print)
    .catch(console.error)
const { readFile } = require('fs').promises
const [ bigFile,  mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile)
    .then((contents) => {
        print(contents)
        return readFile(mediumFile) // The `then` method return a promise
    })
    .then((contents) => {
        print(contents)
        return readFile(smallFile)
    })
    .then(print)
    .catch(console.error)

```

Let's consider the same scenario of the files array that we dealt with in the previous section.
Here's how the same behavior could be achieved with promises:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-5.js
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const data = [] // This array will be pupulated with the content of the files
const print = (contents) => {
  console.log(contents.toString())
}
let count = files.length
let index = 0
const read = (file) => {
  return readFile(file).then((contents) => {
    index += 1
    data.push(contents)
    // This is crucial to understand: since `read` returns a Promise, this means that our current
    // `.then` handler is also returning a Promise. This chaining of Promises allows for serial
    // processing of asynchronous tasks.
    if (index < count) return read(files[index])

    // The `data` array containing the contents of all the processed files, will be passed to the
    // next `.then` handler if there's one attached to the Promise returned by the `read` function
    return data
  })
}

read(files[index]) // It receives the fist file in the `files` array
  .then((data) => {
    print(Buffer.concat(data))
  })
  .catch(console.error)

```

Depending on what we are trying to achieve there is a much simpler way to achieve the same effect
without it being serially executed:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-6.js
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (data) => {
    console.log(Buffer.concat(data).toString())
}

// Let's create an array of promises
const readers = files.map((file) => readFile(file))

// The `Promise.all` function takes an array of promises and returns a promise that resolves when
// all promises have been resolved
Promise.all(readers)
    .then(print)
    .catch(console.error)

```

However if one of the promises was to fail, `Promise.all` will reject, and any successfully resolved
promises are ignored.

If we want more tolerance of individual errors, `Promise.allSettled` can be used in this way:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-7.js
const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
    results
        // We filter all the rejected settled objects and pass the `reason` of each to
        // `console.error`
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        // Then we filter all fulfilled settled objects and create an array of just the values using
        // `map`
        .filter((({status}) => status === 'fulfiled'))
        .map((({value}) => value))
    
    const contents = Buffer.concat(data)
    console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

// The `Promise.allSettled` function returns an array of objects representing the settled status of
// each promise.
// Each object has a `status` property, which may be "rejected" of "fulfilled"
// Objects with a "rejected" `status` will  ccontain a `reason` property with the associated error
// Objects with a "fulfilled" `status` will have a `value` containing the resolved value
Promise.allSettled(readers)
    .then(print)
    .catch(console.error)

```

```txt
$ node promises-7.js
[Error: ENOENT: no such file or directory, open 'not a file'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'not a file'
}
const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
    results
        // We filter all the rejected settled objects and pass the `reason` of each to
        // `console.error`
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        // Then we filter all fulfilled settled objects and create an array of just the values using
        // `map`
        .filter((({status}) => status === 'fulfilled'))
        .map((({value}) => value))
    
    const contents = Buffer.concat(data)
    console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

// The `Promise.allSettled` function returns an array of objects representing the settled status of
// each promise.
// Each object has a `status` property, which may be "rejected" of "fulfilled"
// Objects with a "rejected" `status` will  ccontain a `reason` property with the associated error
// Objects with a "fulfilled" `status` will have a `value` containing the resolved value
Promise.allSettled(readers)
    .then(print)
    .catch(console.error)
const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
    results
        // We filter all the rejected settled objects and pass the `reason` of each to
        // `console.error`
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        // Then we filter all fulfilled settled objects and create an array of just the values using
        // `map`
        .filter((({status}) => status === 'fulfilled'))
        .map((({value}) => value))
    
    const contents = Buffer.concat(data)
    console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

// The `Promise.allSettled` function returns an array of objects representing the settled status of
// each promise.
// Each object has a `status` property, which may be "rejected" of "fulfilled"
// Objects with a "rejected" `status` will  ccontain a `reason` property with the associated error
// Objects with a "fulfilled" `status` will have a `value` containing the resolved value
Promise.allSettled(readers)
    .then(print)
    .catch(console.error)

```

If we want promises to un in parallel independently, we can either use `Promise.allSettled` or
simple execute each of them with their own `then` and `catch` handlers:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/promises/promises-8.js
const { readFile } = require('fs').promises
const [bigFile, smallFile, mediumFile] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile).then(print).catch(console.error)
readFile(mediumFile).then(print).catch(console.error)
readFile(smallFile).then(print).catch(console.log)

```

```txt
$ node promises-8.js 
const { readFile } = require('fs').promises
const [bigFile, smallFile, mediumFile] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile).then(print).catch(console.error)
readFile(mediumFile).then(print).catch(console.error)
readFile(smallFile).then(print).catch(console.log)

const { readFile } = require('fs').promises
const [bigFile, smallFile, mediumFile] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile).then(print).catch(console.error)
readFile(mediumFile).then(print).catch(console.error)
readFile(smallFile).then(print).catch(console.log)

const { readFile } = require('fs').promises
const [bigFile, smallFile, mediumFile] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

readFile(bigFile).then(print).catch(console.error)
readFile(mediumFile).then(print).catch(console.error)
readFile(smallFile).then(print).catch(console.log)

```

## Async/Await
The keywords `async` and `await` allow from an approach that looks similar in style to synchronous
code.
```js
// Declaring an async function
async function(){}

```

An async function always return a promise that will resolve to what's returned inside of the async
function body.

The `await` keyword can only be inside of async functions. The `await` keyword will pause the
execution of the async function until the awaited promise is resolved. The resolved value of that
promise will be returned from an `await` expression.

Here's an example of the same `readFile` operation from the previous section, using an async
function:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await.js
const { readFile } = require('fs').promises

async function run() {
    // We use the `await` keyword on the promise value returned from `readFile`
    // This execution is paused until `readFile` resolves
    // When it resolves, the `contents` constant will be assigned the resolve value
    const contents = await readFile(__filename)

    // Then `contents` will be printed
    console.log(contents.toString())
}

// Here we call the async function `run`
// Async functions always return a promise, so we can chain a `catch` method to ensure any
// rejections are handled, for example, in case `readFile` had an error 
run().catch(console.error)

```

```txt
$ node async-await.js
const { readFile } = require('fs').promises

async function run() {
    // We use the `await` keyword on the promise value returned from `readFile`
    // This execution is paused until `readFile` resolves
    // When it resolves, the `contents` constant will be assigned the resolve value
    const contents = await readFile(__filename)

    // Then `contents` will be printed
    console.log(contents.toString())
}

// Here we call the async function `run`
// Async functions always returns a promise, so we can chain a `catch` method to ensure any
// rejections are handled, for example, in case `readFile` had an error 
run().catch(console.error)

```

The async/await syntax enables the cleanest approach to serial execution:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-2.js
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // For sequential execution we simply await those operations in order
    print(await readFile(bigFile))
    print(await readFile(mediumFile))
    print(await readFile(smallFile))
}

run().catch(console.error)

```

```txt
$ node async-await-2.js 
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // For sequential execution we simply await those operations in order
    print(await readFile(bigFile))
    print(await readFile(mediumFile))
    print(await readFile(smallFile))
}

run().catch(console.error)

const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // For sequential execution we simply await those operations in order
    print(await readFile(bigFile))
    print(await readFile(mediumFile))
    print(await readFile(smallFile))
}

run().catch(console.error)

const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // For sequential execution we simply await those operations in order
    print(await readFile(bigFile))
    print(await readFile(mediumFile))
    print(await readFile(smallFile))
}

run().catch(console.error)

```

Concatenating files after they've been loaded is also trivial with async/await:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-3.js
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // In this example, we don't need to relay on `index` or `count` variables
    const data = [
        // We populate the data declarativelly instead of using `push`
        // The async/await syntax allows for declarative asynchronous implementations
        await readFile(bigFile),
        await readFile(mediumFile),
        await readFile(smallFile),
    ]
    print(Buffer.concat(data))
}

run().catch(console.error)

```

```txt
$ node async-await-3.js 
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // In this example, we don't need to relay on `index` or `count` variables
    const data = [
        // We populate the data declarativelly instead of using `push`
        // The async/await syntax allows for declarative asynchronous implementations
        await readFile(bigFile),
        await readFile(mediumFile),
        await readFile(smallFile),
    ]
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // In this example, we don't need to relay on `index` or `count` variables
    const data = [
        // We populate the data declarativelly instead of using `push`
        // The async/await syntax allows for declarative asynchronous implementations
        await readFile(bigFile),
        await readFile(mediumFile),
        await readFile(smallFile),
    ]
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises
const print = (contents) => {
    console.log(contents.toString())
}
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

async function run() {
    // In this example, we don't need to relay on `index` or `count` variables
    const data = [
        // We populate the data declarativelly instead of using `push`
        // The async/await syntax allows for declarative asynchronous implementations
        await readFile(bigFile),
        await readFile(mediumFile),
        await readFile(smallFile),
    ]
    print(Buffer.concat(data))
}

run().catch(console.error)

```

What about the scenario with files array of unknown length?
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-4.js
const { readFile } = require('fs').promises

const print = (contents) => {
    console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run() {
    const data = []
    for (const file of files) {
        // Here we use an await inside a loop, which is fitting for scenarios where operations
        // must be sequentially called
        data.push(await readFile(file))
    }
    print(Buffer.concat(data))
}

run().catch(console.error)

```

```txt
$ node async-await-4.js
const { readFile } = require('fs').promises

const print = (contents) => {
    console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run() {
    const data = []
    for (const file of files) {
        // Here we use an await inside a loop, which it's fitting for scenarios where operations
        // must be sequentially called
        data.push(await readFile(file))
    }
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises

const print = (contents) => {
    console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run() {
    const data = []
    for (const file of files) {
        // Here we use an await inside a loop, which it's fitting for scenarios where operations
        // must be sequentially called
        data.push(await readFile(file))
    }
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises

const print = (contents) => {
    console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run() {
    const data = []
    for (const file of files) {
        // Here we use an await inside a loop, which it's fitting for scenarios where operations
        // must be sequentially called
        data.push(await readFile(file))
    }
    print(Buffer.concat(data))
}

run().catch(console.error)

```

For scenarios where the output has only to be ordered, but the order of asynchronous operations
resolves doesn't matter, we can use `Promise.all`, and await the promised returned from it:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-5.js
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
    console.log(contents.toString())
}

// This is a parallel execution with sequential order
async function run() {
    const readers = files.map((file) => {readFile(file)})
    const data = await Promise.all(readers)
    print(Buffer.concat(data))
}

run().catch(console.error)

```

```txt
$ node async-await-5.js
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
    console.log(contents.toString())
}

// This is a parallel execution with sequential order
async function run() {
    const readers = files.map((file) => readFile(file))
    const data = await Promise.all(readers)
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
    console.log(contents.toString())
}

// This is a parallel execution with sequential order
async function run() {
    const readers = files.map((file) => readFile(file))
    const data = await Promise.all(readers)
    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
    console.log(contents.toString())
}

// This is a parallel execution with sequential order
async function run() {
    const readers = files.map((file) => readFile(file))
    const data = await Promise.all(readers)
    print(Buffer.concat(data))
}

run().catch(console.error)

```

As before, `Promise.all` will automatically reject if any of the promises fail. We can use
`Promise.allSettled` to tolerate errors in favor of getting necessary data:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-6.js
const { readFile } = require('fs').promises
const files = [__filename, 'foo', __filename]
const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    // The async/await syntax is highly specialized for serial control flow
    const readers = files.map((file) => readFile(file))
    const results = await Promise.allSettled(readers)
    results
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        .filter(({status}) => status === 'fulfilled')
        .map(({value}) => value)

    print(Buffer.concat(data))
}

run().catch(console.error)

```

```txt
$ node async-await-6.js
[Error: ENOENT: no such file or directory, open 'foo'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'foo'
}
const { readFile } = require('fs').promises
const files = [__filename, 'foo', __filename]
const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    // The async/await syntax is highly specialized for serial control flow
    const readers = files.map((file) => readFile(file))
    const results = await Promise.allSettled(readers)
    results
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        .filter(({status}) => status === 'fulfilled')
        .map(({value}) => value)

    print(Buffer.concat(data))
}

run().catch(console.error)
const { readFile } = require('fs').promises
const files = [__filename, 'foo', __filename]
const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    // The async/await syntax is highly specialized for serial control flow
    const readers = files.map((file) => readFile(file))
    const results = await Promise.allSettled(readers)
    results
        .filter(({status}) => status === 'rejected')
        .forEach(({reason}) => console.error(reason))

    const data = results
        .filter(({status}) => status === 'fulfilled')
        .map(({value}) => value)

    print(Buffer.concat(data))
}

run().catch(console.error)

```

Let's remind ourselves of the callback-based parallel execution example:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-7.js
// We don't need the `promises` version of `readFile`, but the callback-based version
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

// The files are printed as soon as they are loaded
readFile(bigFile, print)
readFile(mediumFile, print)
readFile(smallFile, print)

```

```txt
$ node async-await-7.js 
// We don't need the `promises` version of `readFile`,  but the callback-based version
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => ...

# The contents of the file gets printed three times

```

To get the exact parallel operation behavior, use a `then` handler and then await the promises later
on:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-8.js
const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

async function run() {
    const big = readFile(bigFile)
    const medium = readFile(mediumFile)
    const small = readFile(smallFile)

    // `then` attaches the `print` function as a callback to each promise
    // When a file is read, the `print` function will be called with the file's content, this
    // will ensure the contents are printed out chronologically
    big.then(print)
    medium.then(print)
    small.then(print)

    // Now await the promises. Note that the order of awaiting wouldn't affect the order of the
    // callback execution defined with `then`.
    await small
    await medium
    await big
}

run().catch(console.error)

```

```txt
$ node async-await-8.js
const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
    console.log(contents.toString())
}

# The file content get's printed three times

```

If the complexity for parallel execution grows it may be better to o use a callback based approach
and wrap it at a higher level into a promise, so that can be used in an async/await function:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/async-await/async-await-9.js
const { promisify } = require('util')
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

// Here we've wrapped the callback-based parallel execution approach into a function 
// that accepts a callback (cb) and we've passed that whole function into promisify.
const read = promisify((cb) => {
    let index = 0
    const print = (err, contents) => {
        index += 1
        // Note that the `cb` function will be called only when the three files are read
        if (err) {
            console.error(err)
            if (index === 3) cb()
            return
        }
        console.log(contents.toString())
        if (index === 3) cb()
    }
    readFile(bigFile, print)
    readFile(mediumFile, print)
    readFile(smallFile, print)
})

async function run() {
    await read()
    // This means that our read function returns a promise that resolves 
    // when all three parallel operations are done, after which the run 
    // function logs out:
    console.log('finished!')
}

run().catch(console.error)

```

```txt
$ node async-await-9.js
const { promisify } = require('util')
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

# The contents of the file gets printed three times
finished!

```

## Canceling Asynchronous Operations
Asynchronous operations sometimes don't need to continue once started. Instead of delaying their
start, a better method is to initiate and cancel if necessary. Node core has adopted the
standardized `AbortController` and `AbortSignal` Web APIs to cancel such tasks efficiently across
various async contexts.

The `AbortController` and `AbortSignal` are primarily used in Node to address the fact that
promise-based APIs return promises, though they can also be applied to callback-based APIs.

To use a very simple example, here's a traditional callback-based timeout:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/cancelling-async-ops/cancelling.js
const timeout = setTimeout(() => {
    console.log('will not be logged')
}, 1000)

// The timeout is cleared before its callback can be called
setImmediate(() => { clearTimeout(timeout) })

```
```txt
$ node cancelling.js

```

How to achieve the same behavior with a promise-based timeout:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/cancelling-async-ops/cancelling-2.mjs
import { setTimeout } from 'timers/promises'

// The imported `setTimeout` function doesn't need a callback, instead it returns a promise that
// resolves after the specified delay. Optionally, the promise resolves to the value of the second
// argument
const timeout = setTimeout(1000, 'will be logged')

setImmediate(() => {
    // Since `timeout` variable is a promise and not a timeout identifier, `clearTimeout` ignores it
    // so the asynchronous timeout operation never gets cancelled
    clearTimeout(timeout)
})

// Then we log the resolved promise
console.log(await timeout)

```
```txt
$ node cancelling-2.mjs
will be logged

```

Some asynchronous operations have unique cancelation methods that don't easily fit into a
standardized promise-based API. For instance, functions might return objects with methods like
"cancel", "abort", or "destroy" to stop the ongoing operation. Simple native promises can't handle
these varied methods. Using an `AbortSignal` provides a consistent way to cancel these promisified
operations:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/examples/cancelling-async-ops/cancelling-3.mjs
import { setTimeout } from 'timers/promises'

// Create an instance of `AbortController`
const ac = new AbortController()

// Extract the `AbortSignal` instance from the controller
const { signal } = ac

// Set a timeout and pass the `signal` to it via the options argument, which allows for cancellation
// The API will monitor for an abort event on this `signal`
const timeout = setTimeout(1000, 'will NOT be logged', { signal })

setImmediate(() => {
    // Call the `abort` method to trigger the abort event on the `signal`
    // This cancels the timeout and rejects the promise with an `AbortError`
    ac.abort()
})

// Handle the `timeout` promise. If aborted, it will throw an `AbortError`
try {
    console.log(await timeout)
} catch (err) {
    // Only rethrow errors that are not due to the abort operation
    if (err.code != 'ABORT_ERR') throw err
}

```
```txt
$ node cancelling.js

```

Many parts of the Node core API accept a signal option, including `fs`, `net`, `http`, `events`,
`child_process`, `readline` and `stream`.

## Labs
### Lab 8.1 - Parallel Execution
In the labs-1 folder, the `parallel.js` file contains the following:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/labs/labs-1/parallel.js
const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents )
}

const opA = (cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
}

const opB = (cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
}

const opC = (cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
}

```
The `opA` function must be called before `opB`, and `opB` must be called before `opC`.

Call functions in `parallel.js` in such a way that C then B then A is printed out.

### Solution
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/labs/labs-1/parallel-solution.js
const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents )
}

const opA = (cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
}

const opB = (cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
}

const opC = (cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
}

// These operations run in parallel. The order in which the letters (C, B, A) are printed reflects 
// the durations set on each timer
// The call order stated in the exercise was respected.
opA(print)
opB(print)
opC(print)

```
```txt
$ node parallel-solution.js 
C
B
A

```

### Lab 8.2 - Serial Execution
In the `labs-2` folder, the `serial.js` file contains the following:
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/labs/labs-2/serial.js
'use strict'
const { promisify } = require('util')

const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents) 
}

const opA = (cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
}

const opB = (cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
}

const opC = (cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
}

```

Call the functions in such a way that A then B then C is printed out.
Remember `promisify` can be used to convert a callback API to a promise-based API.

The `promisify` function is included at the top of `serial.js` in case a promise based solution
is preferred.


### Solution #1
```js
'use strict'
const { promisify } = require('util')

const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents) 
}

// Use `promisify` to be able of using `then` and `catch` for managing the serial execution
const opA = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
})

const opB = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
})

const opC = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
})

// Chain the asynchronous operations using `then` and returning a promise for the next operation
opA()
    .then((err, contents) => {
        print(err, contents)
        return opB()
    })
    .then((err, contents) => {
        print(err, contents)
        return opC()
    })
    .then((err, contents) => {
        print(err, contents)
    })
    .catch(console.error)


```
```txt
$ node serial-solution-1.js
A
B
C

```

## Solution #2
```js
// 08_ASYNCHRONOUS_CONTROL_FLOW/labs/labs-2/serial-solution-2.js
'use strict'
const { promisify } = require('util')

const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents) 
}

// Use `promisify` to return a promise and be able to use the async/await syntax
const opA = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
})

const opB = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
})

const opC = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
})

// The promises will resolve with the `contents` value
async function run() {
    print(null, await opA())
    print(null, await opB())
    print(null, await opC())
}

run()

```

```txt
$ node serial-solution-2.js
A
B
C

```

## Knowledge Check
1. What is a callback?
- A. A function that is called when an asynchronous operation completes [x]
- B. A function that is called before an asynchronous operation completes
- C. An object that is returned when an asynchronous operation completes

2. What method can be used to handle a promise rejection?
- A. reject
- B. error
- C. catch [x]

3. What does an async function always return?
- A. Whatever value is returned from the function
- B. Nothing
- C. A promise of the returned value [x]
