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

Let's pipe the `process.stdin` readable stream to the `uppercase` transform stream from the previous
chapter, then we'll pipe the resulting stream to the `process.stdout` writable stream:
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
This will allow us typing the input into our process using the terminal. The process input will be
transformed to uppercase and then piped to the process output:
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

// In this example, the `process.stdout` writable stream represents the `out.txt` file, that's why
// the data is not printed in the terminal
process.stdin.pipe(uppercase).pipe(process.stdout)

```

Now let's run the command redirecting to `out.txt` as before:
```txt
# "piped to" is printed to the console even though output is sent to out.txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-5.js > out.txt 
piped to

$ node -p "fs.readFileSync('out.txt').toString()"
595C60375DE0437E097DC4D57482008DCB84F3EDA66D7C268333125D5D8CD8CA8FA0D24FB9EF70AD6E345BA7F1405279055F
853FA267F4B5FAB7CA65E947EFAC3C9438012DBF6BC7DC9F2A376CE330D894EDAF3CEBDA8815AA70495037B6557A58B59C4B

```

Note that `STDOUT` and `STDERR` are separate output devices and *by default* both print
to the terminal. `console.log` prints by default to `STDOUT` and `console.error` prints by
default to `STDERR`.

The `console` methods automatically adds a newline (`\n`) to the input, that's not the case when we
write directly to `process.stderr` or `process.stdout`. That's why we add `\n` when writing to
`process.sterr`. in our previous example.

Let's update the example for using `console.error` instead of writing to the `process.stderr` stream
and demonstrate that indeed `console.error` automaticaly adds a newline at the end, so the result
will be the same:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-6.js
'use strict'
console.error(process.stdin.isTTY ? 'terminal' : 'piped to')
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
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-6.js > out.txt 
piped to

$ node -p "fs.readFileSync('out.txt').toString()" 
F6B2D1711C20D373E2916FA91CDE1603A13D7F3AA972B67C9E808F11B657E893BFC17CD3258B4F698172C3EBA7DE16F76AF3
DDCB1D95647ED0B96970D742FC208ACF4CCFBF660C11D6511B5743EAC2F28B9A10B69D19D988E59981A04751D9144488BDE2

```

While it's beyond of the scope of Node, is useful to know that if we want to redirect the `STDERR`
to another file, using the terminal, we can use `2>`:
```txt
$ node -p "crypto.randomBytes(100).toString('hex')" | node process-os-6.js > out.txt 2> err.txt

$ node -p "fs.readFileSync('err.txt').toString()"
piped to

$ node -p "fs.readFileSync('out.txt').toString()"
D442263687C5E1CFD92A36739350671F0AD282F56E81454E05D1FC0F6511875440FC522C6A403C9E75C4C8241E7CC7CA0D98
16CF50681A4D80BB1E8C9E805F62C1C641475A16FE6B878217354606E5F529D5076CDD9D6C05A28E6919B2462270CBC1E9E2

```

On Windows and POSIX systems (Linux, macOS), file descriptors are numbered handles representing
system I/O channels. The descriptor 2 universally identifies `STDERR`, giving rise to the `2>`
redirect syntax. In Node.js, `process.stderr.fd` holds the value 2, while `process.stdout.fd` is 1,
emphasizing their roles in handling output. You can illustrate this concept in Node using the `fs`
module:
```js
// example
'use strict'
const fs = require('fs')
const myStdout = fs.createWriteStream(null, {fd: 1})
const myStderr = fs.createWriteStream(null, {fd: 2})
myStdout.write('stdout stream')
myStderr.write('stderr stream')

```

However, despite this example, always prefer using `process.stdout` and `process.stderr`. They're
tailored with specialized features, ensuring optimized performance and behavior in Node
applications.

## Exiting
When a process has nothing to do, it exits by itself. For instance, let's look at this code:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-7.js
console.log('exit after this')

```
```txt
$ node process-os-7.js 
exit after this

```

In Node.js, certain APIs possess **active handles** which are references that prevent the process
from auto-exiting. For example, `net.createServer` establishes an active handle, allowing the server
to await requests. Likewise, *timeouts and intervals* maintain active handles to ensure the process
remains open:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-8.js
'use strict'
setInterval(() => {
    console.log('this is keeping the process open')
}, 500)

```
```txt
$ node process-os-8.js 
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
this is keeping the process open
^C

```

To force a process to exit at any time we can call `process.exit`:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-9.js
'use strict'
setInterval(() => {
    console.log('this interval is keeping the process open')
}, 500)
setTimeout(() => {
    console.log('exit after this')
    process.exit()
}, 1750)

```

This will cause the process to exit after the function passed to `setInterval` has been called three
times:
```txt
$ node process-os-9.js 
this interval is keeping the process open
this interval is keeping the process open
this interval is keeping the process open
exit after this

$ echo $? 
0

```

Exit status codes indicate a process's termination status. Universally, a code of "0" signifies
successful execution. On Linux/macOS, check with echo `$?`. For Windows, use echo `%ErrorLevel%` in
`cmd.exe` or `$LastExitCode` in PowerShell. Different platforms might interpret other codes
uniquely.

You can pass an exit code with `process.exit`. While any non-zero code implies an error, using "1"
generally denotes a failure. On Windows, this technically translates to "Incorrect function", but
it's widely understood as a generic error. Let's modify our code to pass `process.exit` the code 1:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-10.js
setInterval(() => {
    console.log('this interval is keeping the process open')
}, 500)
setTimeout(() => {
    console.log('exit after this')
    // Now we pass 1 to `process.exit`
    process.exit(1)
}, 1750)

```
```txt
$ node process-os-10.js
this interval is keeping the process open
this interval is keeping the process open
this interval is keeping the process open
exit after this

$ echo $?
1

```

The exit code can also be set independently to `process.exitCode`. Making the following change in
our code, the output will be the same:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-11.js
setInterval(() => {
    console.log('this interval is keeping the process open')
    process.exitCode = 1
}, 500)
setTimeout(() => {
    console.log('exit after this')
    process.exit()
}, 1750)

```
```txt
$ node process-os-11.js
this interval is keeping the process open
this interval is keeping the process open
this interval is keeping the process open
exit after this

$ echo $?              
1

```

The `exit` event can also be used to detect when a process is closing and perform any final actions
using a handler function. However, no asynchronous work can be done in that event handler because
the process is exiting:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-12.js
'use strict'
setInterval(() => {
    console.log('this interval is keeping the process open')
    process.exitCode = 1
}, 500)
setTimeout(() => {
    console.log('exit after this')
    process.exit()
}, 1750)
process.on('exit', (code) => {
    console.log('exiting with code', code)
    setTimeout(() => {
        // No asynchronous work can be done because the process is exiting
        console.log('this will never happen')
    }, 1)
})

```
```txt
$ node process-os-12.js
this interval is keeping the process open
this interval is keeping the process open
this interval is keeping the process open
exit after this
exiting with code 1

```

## Process Info
The `process` object also contains other pieces of information about the process, such as:
- `process.cwd()`: the current working directory, that is the folder in which the process was
executed in
- `process.chdir()`: changes the current working directory in a Node.js process.
For example, `process.chdir('/tmp')` switches the directory to `/tmp`
- `process.id`: shows the PID.
- `process.platform`: the process platform indicates the host OS (both `process.platform` and
`os.platform()` in Node.js return the same thing).

|process.platform|Operating System|
|:----|:----|
|`aix`|IBM AIX|
|`darwin`|macOS|
|`freebsd`|FreeBSD|
|`linux`|Linux|
|`openbsd`|OpenBSD|
|`sunos`|Solaris / Illumos / SmartOS|
|`win32`|Windows|
|`android`|Android| experimental|

In our case:
```txt
$ node -p process.platform 
linux

```

- `process.env`: represents an object containing environment variables. For instance, a `KEY=value`
environment variable translates to `{ KEY: 'value' }` in the object:
```txt
$ node -p process.env 
{
  USER: 'user',
  HOME: '/home/user',
  OLDPWD: '/node-js-application-development-lfw211/14_PROCESS_&_OPERATING_SYSTEM/examples',
  DESKTOP_SESSION: 'ubuntu',
  # truncated
}

```

`process.env` dynamically interacts with the OS to form an object from environment variables.
Although resembling a JS object, modifying values like `process.env.FOO='my env var'`, impacts just
the Node process. It neither instantaneously reflects OS changes nor supports conventional object
enumeration.

`process.env.PWD` also contains the current working directory, but after using `process.chdir`, only
`process.cwd()` updates to the new path.

## Process Stats
The `process` object has methods which allow us to query resource usage.

### `process.uptime`
Is the amount of seconds (with 9 decimal places), that the *process* has been executing for:
```js
// 14_PROCESS_&_OPERATING_SYSTEM/examples/process-os-14.js
'use strict'
console.log('Process Uptime', process.uptime())
setTimeout(() => {
    console.log('Process Uptime', process.uptime())
}, 1000)


```
```txt
$ node process-os-14.js 
Process Uptime 0.017067214
Process Uptime 1.019615477

```
