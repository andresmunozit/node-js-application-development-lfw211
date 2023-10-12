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

We used the `pipe` method instead of the `pipeline` function due to the unique nature of
`process.stdin`, `process.stdout`, and `process.stderr` streams. These streams don't end, error, or
close. An end in these streams implies the process is either crashing or finishing. Despite
potential issues, we didn't add error handling to the `uppercase` transform stream because any
significant problem would naturally crash the process.

The `process.stdin.isTTY` will return `true` if the input is received directly from the terminal, or
`undefined` (wich can be treated as `false`) if the input is being piped from another command. Let's
see an example:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-4.js
'use strict'
// Instead of printing "initialized", now it will print if our process is being piped to, or if the
// standard input is directly connected to the terminal
console.log(process.stdin.isTTY ? 'terminal' : 'piped to')
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
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-4.js 
piped to
77E27377472B8850C931153BD76DE8740695B69D9042E77A971BDBF4C72276FCA6C75F4C99C660CD4A8C3493E8E838553DD7
3754D688500A5ACA145D55019405B5C35765FD9DA98A8B87D2F953EEB1CA9969DF69903642813BFABAD386AC5BAC1EF0C68B

```

If we execute our code without piping to it, the process will be directly connected to the terminal.
This will allow us to type the input into our process. The process input will be transformed to
uppercase and then piped to the process output:
```txt
$ node process-os-4.js
terminal
hello, world!
HELLO, WORLD!
foo
FOO

```

Typically output sent to `process.stderr` is secondary output, it might be error messages, warnings
or debug logs. In the next example, let's redirect the process output to a file (instead of the
console):
```txt
# The ">" character sends the output to the given "out.txt" file
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-4.js > out.txt

$ node -p "fs.readFileSync('out.txt').toString()"
piped to
A47BADE0623213344848B89807A1A44426CA2171DF01533B80980C89188DA8FD81D53D8B211B2DA07746406AF2EF21EAE18E
2273C9CE241DD63FF8887CBD6416C6C329030FAF56FB6BE8C3F1044F3533B55A782FCD67613452FAE5BC72893F3C28110110

```

Now let's alter our code:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-5.js
'use strict'
// We replace the `console.log` call with a write to the `process.stderr` stream
process.stderr.write(process.stdin.isTTY ? 'terminal\n' : 'piped to\n')
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

Now let's run the command redirecting to `out.txt` as before:
```txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-5.js > out.txt 
piped to

$ node -p "fs.readFileSync('out.txt').toString()"
595C60375DE0437E097DC4D57482008DCB84F3EDA66D7C268333125D5D8CD8CA8FA0D24FB9EF70AD6E345BA7F1405279055F
853FA267F4B5FAB7CA65E947EFAC3C9438012DBF6BC7DC9F2A376CE330D894EDAF3CEBDA8815AA70495037B6557A58B59C4B

```
