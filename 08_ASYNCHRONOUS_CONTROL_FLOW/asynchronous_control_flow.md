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
callback is known as an Errback

Imagine a program with three variables, `smallFile`, `mediumFile`, `bigFile` each which holds the
path of a file of a greater size than the last. If we want to log out the contents of each file
based on the when that file has been loaded (chronological order), we can do something like the
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


```
