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

If a value is returned from `then`, the `then` method will return a promise that resolves to that
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

If a promise is returned from  a `then` handler, the `then` method will  return a promise, this
allows for an easy serial execution:
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
        return readFile(mediumFile) // The `then` method return a promise
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
const data = []
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
promises are ignored. If we want more tolerance of individual errors, `Promise.allSettled` can be:
```js


```
