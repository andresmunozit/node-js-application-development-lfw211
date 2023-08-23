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

In the following example, the goal is to print all the file contents out in the order they appear in
the array:
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

// Define a function to handle the result of reading all files.
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
