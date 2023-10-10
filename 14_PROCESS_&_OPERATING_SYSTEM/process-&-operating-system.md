# Process & Operating System
A Node.js process is the program that is currently running our code. Node's `process` object manages
our code's runtime, while the `os` module gives insights into the host OS. We'll delve into both.

## STDIO
STDIO (Standard Input/Output) refers to the primary means by which a Node application interacts with
the terminal. The `process` object exposes three streams:
- `process.stdin`: A readable stream for process input
- `process.stdout`: A writable stream for process output
- `process.stderr`: A writable stream for process error output

Let's start with an example. We will write a simple command that generates random bytes:
```txt
$ node -p "crypto.randomBytes(100).toString('hex')"
09925faec7ebe6239873aa5c7f0ad7e723b5db3a7ed606e61c1648cbf4559ef4a6830c675ad3fe7b5b7077eca8adcffcd864
a89db62abaefac4deb4095b29dfee6e6d748f8d8ae90f81e1d0a339ce61babe0c3cfe873c572e7575993a1d3a2150816cc2c

```

Now let's create an example JS file that prints that it initialized and then exits:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-1.js
'use strict'
console.log('initialized')

```
```txt
node process-os-1.js 
initialized

```

If we attempt to use the command line to pipe the output from the random byte command into our
process, nothing will happen:
```txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-1.js
initialized

```

Let's update our program to use the input we're piping from the random bytes command into our
process. The input will be written out from our process:
```js
'use strict'
console.log('initialized')
process.stdin.pipe(process.stdout)

```
```txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-2.js
initialized
b30d137c2b1ba7769a972ac6b2d7f4e5068fb344f521a46b089bb19b27ab81838471395aa1eb9b08531f710f6860907255ea
15ffffe8797f6297db2eca8770bac674d0a305f9c5e52b6eaeb7beb143ed44dc325aae1ac98043d3ea049517439f0a0086bb

```

Let's pipe the `process.stdin` stream to the uppercase stream from the previous chapter, then we'll
pipe the resulting stream to the `process.stdout` stream:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-3.js
'use strict'
console.log('initialized')
const { Transform } = require('stream')
const createUppercaseStream = () => {
    return new Transform({
        transform(chunk, enc, next) {
            const uppercased = chunk.toString().toUpperCase()
            next(null, uppercased)
        }
    })
}

const uppercase = createUppercaseStream()
process.stdin.pipe(uppercase).pipe(process.stdout)

```
```txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-3.js
initialized
314CFD45B3E9D520AE9967DA121024D81C0AD589FC2D52E5F7E858D65AE79A666FA096AD5F878F63C03FB5EB5C55E2A78029
E06154F1445ABF2B694E35DF6E5D4CBE391AC513042FB15B654ADAC14015276907A0772CD0D736D011CBBD3F62268AD1F0A2

```
