# Creating Child Processes
The Node.js core `child_process` module enables spawning new processes from the current parent
process. These child processes can be any executable, not limited to Node.js. This chapter delves
into methods to initiate and manage these child processes.

## Child Process Creation
The `child_process` module has the following methods, all of which spawn a process some way or
another:
- `exec` & `execSync`
- `spawn` & `spawnSync`
- `execFile` & `execFileSync`
- `fork`

Before zoom in `exec` and `spawn`, let's briefly cover the other listed methods.

## `execFile` & `execFileSync` Methods
`execFile` and `execFileSync` directly execute binary paths, bypassing the shell. This boosts
efficiency but may sacrifice some features compared to `exec` and `execSync`.

## Fork Method
The `fork` method, a variant of the `spawn` method, launches a new Node process to execute a
JavaScript file, defaulting to the current one, and establishes Interprocess Communication (IPC) by
default.

## `exec` & `execSync` Methods
The `execSync` method is the simplest way to execute a command:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-1.js
'use strict'
const { execSync } = require('child_process')

// `execSync` returns a buffer containing the output (from STDOUT) of the command.
const output = execSync(
    // Using backticks to execute a command without quote issues. In this case it's a Node command.
    `node -e "console.log('subprocess stdio output')"`
)
console.log(output.toString())

```
```txt
$ node  child-1.js
subprocess stdio output

```

In our previous example we executed the node binary, however any available command can be executed:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-2.js
'use strict'
const { execSync } = require('child_process')
const cmd = process.platform === 'win32' ? 'dir' : 'ls'
const output = execSync(cmd)
console.log(output.toString())

```
```txt
$ node child-2.js 
child-1.js
child-2.js

```

If we intend to run the `node` binary in a child process, it's advisable to use the full path of the
`node` binary from the currently active Node process. The path can be found in `process.execPath`:
```txt
$ node -p "process.execPath" 
/home/user/.nvm/versions/node/v18.15.0/bin/node

```

By using `process.execPath`, you guarantee that the child process runs the same Node.js version as
the parent. Here's how to utilize it:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-3.js
'use strict'
const { execSync } = require('child_process')

// `execSync` doesn't capture `STDERR` output, so `output` will remain empty. Instead child process'
// `STDERR` will be routed to the parent's `STDERR` by default
const output = execSync(
    // The -e flag evaluates the given script. Here, the script writes to `STDERR`.
    `"${process.execPath}" -e "console.error('subprocess stdio output')"`
)

console.log(output.toString())

```

Remember, `execSync` routes the child's `STDERR` to the parent's `STDERR` by default. Therefore,
when `console.error` in the subprocess writes to `STDERR`, it gets displayed in the terminal.
However, since `execSync` exclusively captures `STDOUT` and omits `STDERR`, the `output` variable
stays empty:
```txt
$ node child-3.js 
subprocess stdio output

```

If the subprocess exits with a non-zero exit code, the `execSync` function will throw:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-4.js
'use strict'
const { execSync } = require('child_process')

try {
    // In this case nothing is writen to `STDERR`, instead `execSync` throws
    execSync(`"${process.execPath}" -e "process.exit(1)"`)
} catch (err) {
    console.error('CAUGHT ERROR:', err)
}

```
```txt
$ node child-4.js 
CAUGHT ERROR: Error: Command failed: "/home/user/.nvm/versions/node/v18.15.0/bin/node" -e "process.exit(1)"
    at checkExecSyncError (node:child_process:885:11)
    at execSync (node:child_process:957:15)
    at Object.<anonymous> (/node-js-application-development-lfw211/15_CREATING_CHILD_PROCESSES/example/child-4.js:5:5)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  status: 1,
  signal: null,
  output: [ null, <Buffer >, <Buffer > ],
  pid: 2952113,
  stdout: <Buffer >,
  stderr: <Buffer >
}

```

The error object in the `catch` block shows `status` as 1 due to the subprocess's `process.exit(1)`.
For non-zero exit codes, `err.stderr` is helpful for identifying error messages from the subprocess.
Both `err.stderr` and `err.output[2]` reflect what's written to `STDERR` by the subprocess. In this
instance, `STDERR` is empty. `err.output[2]` corresponds to the output from the standard error
(fd = 2) of the subprocess

Let's throw an error instead, this time we will control exactly the error that will be caught in the
`try/catch` block:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-5.js
'use strict'
const { execSync } = require('child_process')

try {
    execSync(`"${process.execPath}" -e "throw Error('kaboom')"`)
} catch (err) {
    console.error('CAUGHT ERROR:', err)
}

```
```txt
$ node child-5.js
[eval]:1
throw Error('kaboom')
^

Error: kaboom
    at [eval]:1:7
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3

Node.js v18.15.0
CAUGHT ERROR: Error: Command failed: "/home/andres/.nvm/versions/node/v18.15.0/bin/node" -e "throw Error('kaboom')"
[eval]:1
throw Error('kaboom')
^

Error: kaboom
    at [eval]:1:7
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3

Node.js v18.15.0

    at checkExecSyncError (node:child_process:885:11)
    at execSync (node:child_process:957:15)
    at Object.<anonymous> (/home/andres/code/andresmunozit/node-js-application-development-lfw211/15_CREATING_CHILD_PROCESSES/example/child-5.js:5:5)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47 {
  status: 1,
  signal: null,
  output: [
    null,
    <Buffer >,
    <Buffer 5b 65 76 61 6c 5d 3a 31 0a 74 68 72 6f 77 20 45 72 72 6f 72 28 27 6b 61 62 6f 6f 6d 27 29 0a 5e 0a 0a 45 72 72 6f 72 3a 20 6b 61 62 6f 6f 6d 0a 20 20 ... 303 more bytes>
  ],
  pid: 2957145,
  stdout: <Buffer >,
  stderr: <Buffer 5b 65 76 61 6c 5d 3a 31 0a 74 68 72 6f 77 20 45 72 72 6f 72 28 27 6b 61 62 6f 6f 6d 27 29 0a 5e 0a 0a 45 72 72 6f 72 3a 20 6b 61 62 6f 6f 6d 0a 20 20 ... 303 more bytes>
}

```

In the previous command output, `CAUGHT ERROR` is the error output for the subprocess. This is
contained in the buffer `err.stderr` and `err.output[2]`.

This execution printed two stacks, the *first stack* is the functions called inside the
*subprocess*, the *second stack* is the function calls from the *parent process*.

An uncaught throw on the subprocess, results in `err.status = 1`, which indicates *generic* failure

### `exec` Method
The `exec` method asynchronously executes a shell command provided as a string. It accepts a
callback function, which receives three arguments: `err`, `stdout`, and `stderr`. Unlike `execSync`,
the `exec` function clearly distinguishes between `stdout` and `stderr` by providing them as
separate arguments to the callback:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-6.js
'use strict'
const { exec } = require('child_process')

exec(
    `"${process.execPath}" -e "console.log('A');console.error('B')"`,
    (err, stdout, stderr) => {
        console.log('err', err)
        console.log('subprocess stdout: ', stdout.toString())
        console.log('subprocess stderr: ', stderr.toString())
    } 
)

```
```
$ node child-6.js 
err null
subprocess stdout:  A

subprocess stderr:  B

```

Even though `STDERR` was written to, `err` is `null` because the process ended with zero exit code.

Let's throwing an error without catching it in the subprocess:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-7.js
'use strict'
const { exec } = require('child_process')

exec(
    `"${process.execPath}" -e "console.log('A');throw Error('B')"`,
    (err, stdout, stderr) => {
        console.log('err',  err)
        console.log('subprocess stdout: ', stdout.toString())
        console.log('subprocess stderr: ', stderr.toString())
    }
)

```
```txt
$ node child-7.js
err Error: Command failed: "/home/user/.nvm/versions/node/v18.15.0/bin/node" -e "console.log('A');throw Error('B')"
[eval]:1
console.log('A');throw Error('B')
                 ^

Error: B
    at [eval]:1:24
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3

Node.js v18.15.0

    at ChildProcess.exithandler (node:child_process:419:12)
    at ChildProcess.emit (node:events:513:28)
    at maybeClose (node:internal/child_process:1091:16)
    at ChildProcess._handle.onexit (node:internal/child_process:302:5) {
  code: 1,
  killed: false,
  signal: null,
  cmd: `"/home/andres/.nvm/versions/node/v18.15.0/bin/node" -e "console.log('A');throw Error('B')"`
}
subprocess stdout:  A

subprocess stderr:  [eval]:1
console.log('A');throw Error('B')
                 ^

Error: B
    at [eval]:1:24
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at node:internal/process/execution:79:19
    at [eval]-wrapper:6:22
    at evalScript (node:internal/process/execution:78:60)
    at node:internal/main/eval_string:28:3

Node.js v18.15.0

```

The `err` argument is no longer null, it's an error object. In case of asynchronous `exec`,
`err.code` contains the *exit code* instead of `err.status`, which is an unfortunate API
inconsistency. It also doesn't contain the `STDOUT` or `STDERR` buffers since they are passed to the
callback function.

The `err` object also contains two stacks, one for the subprocess followed by a gap and then the
stack of the parent process. The subprocess `stderr` buffer also contains the error as presented by
the subprocess.

## `spawn` & `spawnSync` methods
Both `spawn` and `exec` methods can be used to create child processes. While `execSync` returns a
buffer containing the subprocess `STDOUT`, `spawnSync` returns an object containing information
about the process that was spawned.

While `exec` and `execSync` take a full shell command, spawn takes the executable path as the first
argument and then an array of flags that should be passed to the command as second argument:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-8.js
'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(
    process.execPath,
    ['-e', `console.log('subprocess stdio output')`]
)
console.log(result)

```
```txt
$ node child-8.js 
{
  status: 0,
  signal: null,
  output: [
    null,
    <Buffer 73 75 62 70 72 6f 63 65 73 73 20 73 74 64 69 6f 20 6f 75 74 70 75 74 0a>,
    <Buffer >
  ],
  pid: 78078,
  stdout: <Buffer 73 75 62 70 72 6f 63 65 73 73 20 73 74 64 69 6f 20 6f 75 74 70 75 74 0a>,
  stderr: <Buffer >
}

```

The `result` object has the same properties as the `error` object when `execSync` throws. Both
`result.stdout` and `result.output[1]` contain a buffer with the subprocess' `STDOUT`. Let's print
the child process' `STDOUT` to the terminal, which should be `subprocess stdio output`:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-9.js
'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(
    process.execPath,
    ['-e', `console.log('subprocess stdio output')`]
)

// Let's print the content of the `STDOUT` of the subprocess
// `result.output[1]` contains the same as `result.stdout`
console.log(result.stdout.toString())

```
```txt
$ node child-9.js 
subprocess stdio output

```
  
`spawnSync` differs from `execSync` in that it doesn't throw when the process exits with a non-zero
exit code. This removes the need for a `try/catch` block
```js
// 15_CREATING_CHILD_PROCESSES/example/child-10.js
'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(process.execPath, ['-e', 'process.exit(1)'])
console.log(result)

```
```txt
$ node child-10.js 
{
  status: 1,
  signal: null,
  output: [ null, <Buffer >, <Buffer > ],
  pid: 87443,
  stdout: <Buffer >,
  stderr: <Buffer >
}

```

The `status` property is 1 because of the child's `process.exit(1)`. If an uncaught error occurred
in the subprocess, `result.stderr` would show the error message, and `status` would also be 1.

Finally, when comparing `exec` to `spawn`, note that `exec` takes a callback, while `spawn` does
not. However, both return `ChildProcess` instances with `stdin`, `stdout`, and `stderr` streams.
These instances also extend `EventEmitter`, letting you handle events like `close` to fetch the exit
code.

Let's take a look to an `spawn` example:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-11.js
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    ['-e', `console.log('subprocess stdio output')`]
)

// `sp.pid` is immediately available so we console it
console.log('pid is', sp.pid)

// Pipe child's `STDOUT` (readable for the parent) to the parent's `STDOUT`.
// Note: In the child, `process.stdout` is writable, while in the parent, `sp.stdout` is readable.
sp.stdout.pipe(process.stdout)

// To get the status code, we listen for a `close` event
sp.on('close', (status) => {
    console.log('exit status was', status)
})

```
```txt
$ node child-11.js 
pid is 94766
subprocess stdio output
exit status was 0

```

Let's exit the process with status 1:
```js
'use strict'
const { spawn } = require('child_process')

const sp = spawn(
    process.execPath,
    ['-e', 'process.exit(1)']
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
    console.log('exit  status was', status)
})

```
```txt
$ node child-12.js 
pid is 99869
exit  status was 1

```

There is no second line of output this time, as our code removed any output to `STDOUT`.

The `exec` command in Node.js can operate without a callback. Additionally, it returns a
`ChildProcess` instance. Below is an example:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-13.js
'use strict'
const { exec } = require('child_process')
const sp = exec(
    `"${process.execPath}" -e "console.log('subprocess stdio output')"`
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
    console.log('exit status was', status)
})


```

This leads to the exact same outcome as the equivalent `spawn` example:
```txt
$ node child-13.js 
pid is 102632
subprocess stdio output
exit status was 0

```

In contrast to methods like `exec`, `execSync`, and `spawnSync`, the `spawn` method doesn't buffer
child process output. While the others halt streaming after reaching 1 mebibyte (or 1024 * 1024
bytes, which can be adjusted with `maxBuffer`), `spawn` streams indefinitely. This makes `spawn`
suitable for long-running child processes.

> `spawn` continuously streams child process output without buffering, unlike `exec`, `execSync`,
and `spawnSync` which can halt after 1 mebibyte; making `spawn` preferred for long-running tasks.

## Process Configuration
An options object can be passed to `exec*` and `spawn*` methods. 

By default, a child process inherits the environment variables of the parent process:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-14.js
'use strict'
const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'
const sp = spawn(process.execPath, ['-p', 'process.env'])
sp.stdout.pipe(process.stdout)

```

The environment variables of the child process include the parent's variable `A_VAR_WE`:
```txt
$ node child-14.js 
{
  // ...
  A_VAR_WE: 'JUST SET'
}

```

Now let's pass an `env` object via the options object:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-15.js
'use strict'

const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'

// We provide an options object as the third argument, which includes an `env` property.
const sp = spawn(process.execPath, ['-p', 'process.env'], {
    env: {SUBPROCESS_SPECIFIC: 'ENV VAR'}
})

// `sp.stdout` stream will be written from the subprocess, by `node -p process.env`, then we pipe
// that to the parent's `stdout`
sp.stdout.pipe(process.stdout)

```

When run, the parent displays the child process' environment variables, which only include system
defaults (OS dependant), and those specified in the `env` option:
```
$ node child-15.js 
{ SUBPROCESS_SPECIFIC: 'ENV VAR' }

```

Another option when creating child processes is the `cwd` option:
```js
'use strict'

// Detect if this process is the child or parent based on the environment variable
const { IS_CHILD } = process.env

if (IS_CHILD) {
    // When executed as a child process, log the current working directory and environment
    console.log('Subprocess cwd:', process.cwd())
    console.log('env', process.env)
} else {
    // For path parsing and extracting file system's root directory
    const { parse } =  require('path')
    const { root } = parse(process.cwd())

    // Importing spawn to create a child process
    const { spawn } = require('child_process')

    // Spawn a child process to execute the same script (this file)
    const sp = spawn(process.execPath,  [__filename],  {
        cwd: root, // Set the child process's current working directory to the file system's root
        env: {IS_CHILD: '1'} // Set environment variable to detect child process in next execution
    })

    // Pipe child's STDOUT to parent's STDOUT to display logs
    sp.stdout.pipe(process.stdout)
}

```
```txt
$ node child-16.js 
Subprocess cwd: /
env { IS_CHILD: '1' }

```

The `cwd` and `env` options can be set for any of the child process methods discussed in the prior
section, but there are other options that can be set as well.

## Child STDIO
Remember, `exec` and `spawn` return a `ChildProcess` instance witch has `stdin`, `stdout` and
`stderr` streams, representing the I/O of the subprocess. This is the default behavior, but it can
be altered. Let's start with an example with the default behavior:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-17.js
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        // The process we're spawning writes to `stderr` using `console.error`, and then pipes
        // `stdin` to `stdout` 
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // The `stdio` option is set to expose streams for all three `STDIO` devices. This is the
    // default.
    { stdio: ['pipe', 'pipe', 'pipe'] } // The `stdio` array indices match file descriptors: 0 for
                                        // `STDIN`, 1 for `STDOUT`, and 2 for STDERR.
)

// In the parent process we pipe the child process' `STDOUT` and `STDERR` to the parent `STDOUT`
sp.stdout.pipe(process.stdout)
sp.stderr.pipe(process.stdout)

// By setting `stdio[0]` to its default value of `pipe` (corresponding to `STDIN`), `sp.stdin` is
// made writable from the parent's perspective.
sp.stdin.write('this input will become output')

// Signaling the end of input is crucial; without it, the child process may hang, waiting for more
// input that will never arrive.
sp.stdin.end()

```
```txt
$ node child-17.js 
err output
this input will become output% 

```

For direct piping without data transformation, set the second `stdio` element to `inherit` to use
the parent's `STDOUT` in the child process:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-18.js
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // Set child's `stdout` to inherit from the parent
    { stdio: ['pipe', 'inherit', 'pipe'] }
)

// Only pipe child's `stderr`, as `stdout` is already inherited
sp.stderr.pipe(process.stdout)
sp.stdin.write('this input will become output')
sp.stdin.end()

```

This will result in the same output:
```txt
$ node child-18.js 
err output
this input will become output% 

```

We also can pass streams directly to the `stdio` option:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-19.js
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // Set child's stderr directly to the parent's `stdout`
    { stdio: ['pipe', 'inherit', process.stdout] }
)

// Now we don't need to explicitly pipe `sp.stderr` to `process.stdout`
sp.stdin.write('this input will become output')
sp.stdin.end()

```

Both `sp.stdout` and `sp.stderr` are set to `null` as they aren't configured to `pipe` in the
`stdio` option. Yet, the output remains the same due to the third element in `stdio`. Remember, you
can pass any writable stream to `stdio[1]` or `stdio[2]` (e.g., file stream, network socket, or HTTP
response).
```txt
$ node child-19.js
err output
this input will become output%

```

Let's say we want to *ignore* the subprocess `stderr`:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-20.js
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
    process.execPath,
    [
        '-e',
        // Due to the `stdio[2]` configuration, the `console.error` won't generate visible output
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    // Configuring `stdio[2]` as `ignore` means the subprocess's `STDERR` output is discarded
    { stdio: ['pipe', 'inherit', 'ignore']}
)

// Writing to the child process's stdin
sp.stdin.write('this input will become output\n')
sp.stdin.end()

```
```txt
$ node child-20.js 
this input will become output

```

The `stdio` option applies the same way to the `child_process.exec` function.

For synchronous variants like `spawnSync` and `execSync`, you can provide input directly using the
`input` option. As we've seen before, for the asynchronous `spawn` and `exec` methods, you can use
the `write` method on the returned `ChildProcess` instance to send input to the child's `stdin`:
```js
// 15_CREATING_CHILD_PROCESSES/example/child-21.js
'use strict'
const { spawnSync } = require('child_process')

// The script we're executing writes to `sterr` with `console.error`, then pipes `stdin` to `stdout`
spawnSync(
    process.execPath,
    [
        '-e',
        `console.error('err output'); process.stdin.pipe(process.stdout)`
    ],
    {
        // Providing input directly to the child process
        input: 'this input will become output\n',
        // `stdio` configuration. Here, `STDERR` is set to `ignore`, so its output won't be visible
        stdio: ['pipe', 'inherit', 'ignore']
    }
)

```
```txt
$ node child-21.js 
this input will become output

```

## Labs

### Lab 15.1 - Set Child Process Environment Variable
The `labs-1` folder contains an `index.js`, a `child.js` file and a `test.js` file.
The `child.js` file contains the following:
```js
// labs-june-2023/labs/ch-15/labs-1/child.js
'use strict'
const assert = require('assert')
const clean = (env) => {
    // Convert filtered [key, value] pairs back into an object.
    return Object.fromEntries(
        // Filter keys that start with an underscore or are 'pwd' or 'shlvl'.
        Object.entries(env).filter(([k]) => !/^(_.*|pwd|shlvl)$/i.test(k))
    )
}
const env = clean(process.env)

assert.strictEqual(env.MY_ENV_VAR, 'is set')
assert.strictEqual(
    Object.keys(env).length,
    1,
    'child process should have only one env var'
)
console.log('passed!')

```
The code in `child.js` expects that there will be only one environment variable named `MY_ENV_VAR`
to have the value `is set`. If this is not the case the `assert.strictEqual` method will throw an
assertion error. In certain scenarios some extra environment variables are added to child processes,
these are stripped so that there should only ever be one environment variable set in `child.js`,
which is the `MY_ENV_VAR` environment variable.

The `index.js` file has the following contents:
```js
// labs-june-2023/labs/ch-15/labs-1/index.js
'use strict'

function exercise(myEnvVar) {
    // TODO return a child process with
    // a single environment variable set 
    // named MY_ENV_VAR. The MY_ENV_VAR 
    // environment variable's value should 
    // be the value of the myEnvVar parameter 
    // passed to this exercise function
}

module.exports = exercise

```

Using any `child_process` method except `execFile` and `execFileSync`, complete the exercise
function so that it returns a child process that executes the `child.js` file with node.

To check the exercise implementation, run node `test.js`, if successful the process will
output: `passed!`. If unsuccessful, various assertion error messages will be output to help
provide hints.

One very useful hint up front is: use `process.execPath` to reference the node executable
instead of just passing 'node' as string to the `child_process` method.

The contents of the `test.js` file is esoteric, and the need to understand the code is minimal,
however the contents of `test.js` are shown here for completeness:
```js
// labs-june-2023/labs/ch-15/labs-1/test.js
'use strict'
const { deserialize: d } = require('v8')
const { unlinkSync } = require('fs')
const assert = require('assert')
const { equal, fail } = assert.strict
const exercise = require('.')
const env = freshEnv()

let sp = null
const value = 'is set [' + Date.now() + ']'
try {
    sp = exercise(value)
    assert(sp, 'exercise function should return the result of a child process method')
    if (Buffer.isBuffer(sp)) {
        checkEnv()
        return
    }
} catch (err) {
    const { status } = err
    if (status == null) throw err
    equal(status, 0, 'exit code should be 0')
    return
}

if (!sp.on) {
    equal(sp.status, 0, 'exit code should be 0')
    checkEnv()
    return
}

const timeout = setTimeout(checkEnv, 5000)
sp.once('exit', (status) => {
    equal(status, 0, 'exit code should be 0')
    clearTimeout(timeout)
    checkEnv()
})

function checkEnv() {
    let childEnv = null
    try {
        childEnv = loadEnv('./child-env.json')
    } catch {
        fail('child process misconfigured (cannot access child-env.json)')
    }
    for (let prop in env) if (Object.hasOwn(childEnv, prop)) delete childEnv[prop]
    equal(childEnv.MY_ENV_VAR, value)
    equal(
        Object.keys(childEnv).length,
        1,
        'child process should have only one env var'
    )
    console.log('passed!')
}

function freshEnv() {
    require('child_process').spawnSync(process.execPath, [require.resolve('./child'), 'fresh'], d(Buffer.from('/w9vIgNlbnZvewB7AQ==', 'base64')))
    return loadEnv('./fresh-env.json')
}

function loadEnv(str, retry = 0) {
    try {
        return require(str)
    } catch (err) {
        if (retry > 5) throw err
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500)
        return loadEnv(str, ++retry)
    } finally {
        try { unlinkSync(require.resolve(str)) } catch { /*ignore*/ }
    }
}

```

The `test.js` file allows for alternative approaches, once the exercise function has been completed
with one `child_process` method, re-attempt the exercise with a different `child_process` method.

#### Solution 1
```js
// Example code
'use strict'
const { spawn } = require('child_process')
const { join } = require('path')

function exercise(myEnvVar) {
    // TODO return a child process with
    // a single environment variable set 
    // named MY_ENV_VAR. The MY_ENV_VAR 
    // environment variable's value should 
    // be the value of the myEnvVar parameter 
    // passed to this exercise function
    return spawn(
        process.execPath,
        [join(__dirname, 'child.js')],
        {
            env: {MY_ENV_VAR: myEnvVar}
        }
    )
}

module.exports = exercise

```
```
$ node test.js
passed!
```

#### Solution 2
```js
// 15_CREATING_CHILD_PROCESSES/labs/labs-1/index.js
'use strict'
const { exec } = require('child_process')
const { join } = require('path')

function exercise(myEnvVar) {
    // TODO return a child process with
    // a single environment variable set 
    // named MY_ENV_VAR. The MY_ENV_VAR 
    // environment variable's value should 
    // be the value of the myEnvVar parameter 
    // passed to this exercise function
    return exec(
        `"${process.execPath}" "${join(__dirname, 'child.js')}"`,
        // Options object should be the second argument. A callback function, with the format
        // `(err, stdout, stderr)`, can be the third argument if needed.
        {
            env: {MY_ENV_VAR: myEnvVar}
        }
    )
}

module.exports = exercise

```
```txt
$ node test.js
passed!

```

### Lab 15.2 - STDIO Redirection
The labs-2 folder `index.js` file contains the following:
```js
// 15_CREATING_CHILD_PROCESSES/labs/labs-2/index.js
'use strict'

const { spawn } = require('child_process')

function exercise(command, args) {
    return spawn(command, args)
}

module.exports = exercise

```

Complete the exercise function so that the returned child process:
- Has no ability to read `STDIN`.
- Redirects its `STDOUT` to the parent process' `STDOUT`.
- Exposes `STDERR` as a readable stream.

The labs-2 folder also contains a `test.js` file.

To verify that the exercise was completed successfully run `node test.js`, if the
implementation is correct the process will output: `passed!`.

It is unnecessary to understand the contents of the `test.js` file, but the contents of it are as
follows:
```js
// 15_CREATING_CHILD_PROCESSES/labs/labs-2/test.js
'use strict'
const exercise = require('.')
const cp = require('child_process')
const assert = require('assert')
const { equal } = assert.strict
const { SCENARIO } = process.env
const [node] = process.argv

const stdoutCheck = () => { exercise(node, [`-p`, `'test'`]) }
const stderrCheck = () => {
    const sp = exercise(node, [`-e`, `console.error('test')`])
    if (sp.stderr) sp.stderr.pipe(process.stderr)
}
const stdinCheck = () => {
    exercise(node, [`-e`, `
      process.stdout.write(Buffer.from([0]))
      process.stdin.pipe(process.stdout)
      setTimeout(() => {
        process.stdout.write(Buffer.from([1]))
      }, 100)
  `])
}

function test(scenario = 0) {

    switch (scenario) {
        case 1: return stdoutCheck()
        case 2: return stderrCheck()
        case 3: return stdinCheck()
    }

    const s1 = cp.spawnSync(node, [__filename], {
        env: { SCENARIO: 1 },
    })

    equal(s1.stdout.toString().trim(), 'test', 'should inherit stdout')

    const s2 = cp.spawnSync(node, [__filename], {
        env: { SCENARIO: 2 },
    })

    equal(s2.stderr.toString().trim(), 'test', 'should expose stderr stream')


    const s3 = cp.spawnSync(node, [__filename], {
        input: 'some input',
        env: { SCENARIO: 3 },
    })

    equal(s3.stdout.length, 2, 'stdin should be ignored')

    console.log('passed!')

}

test(Number(SCENARIO))

```

#### Solution 1
```js
// 15_CREATING_CHILD_PROCESSES/labs/labs-2/index.js
'use strict'

const { spawn } = require('child_process')

function exercise(command, args) {
    return spawn(command, args, {
        stdio: ['ignore', 'inherit', 'pipe']
    })
}

module.exports = exercise

```

#### Solution 2
Configuring the child `STDIO` post-creation:
```js
// 15_CREATING_CHILD_PROCESSES/labs/labs-2/index.js
'use strict'

const { spawn } = require('child_process')

function exercise(command, args) {
    const sp = spawn(command, args)

    // This is the equivalent of using the 'ignore' option for `stdin` in the `stdio` array. It ends
    // the writable stream.
    sp.stdin.end()
    sp.stdout.pipe(process.stdout)
    // sp.stderr is already a readable stream and will remain so

    return sp
}

module.exports = exercise

```

## Knoledge Check

### Question 15.1
What option sets the folder that a child process should execute in?
- A. `dir`
- B. `pwd`
- C. `cwd` [x]

### Question 15.2
Which `child_process` method can start any executable and has no limit on child process output?
- A. `exec`
- B. `spawn` [x]
- C. `fork`

### Question 15.3
If a child process is started with the `stdio` option set to `['pipe', 'ignore', 'inherit']`, how
will the I/O of the child process behave?
- A. The child process `stdout` property will be a readable stream, it will not be possible to write
to the `STDIN` of the process, and any output written to `STDERR` will be written to the parent
`STDERR`
- B. The child process `stdin` property will be a writable stream, `STDERR` output will be ignored
but `STDOUT` output will be written to the parent `STDOUT`
- C. The child process `stdin` property will be a writable stream, `STDOUT` output will be ignored
but `STDERR` output will be written to the parent `STDERR` [x]
