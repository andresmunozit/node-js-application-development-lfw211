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
when `console.error` writes to `STDERR`, it gets displayed in the terminal. However, since
`execSync` exclusively captures `STDOUT` and omits `STDERR`, the `output` variable stays empty.
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

The `err` argument is no longer null, it's an error object. In case of asynchronous exec, `err.code`
contains the *exit code* instead of `err.status`, which is an unfortunate API inconsistency. It also
doesn't contain the `STDOUT` or `STDERR` buffers since they are passed to the callback function.

The `err` object also contains two stacks, one for the subprocess followed by a gap and then the
stack of the parent process. The subprocess `stderr` buffer also contains the error as presented by
the subprocess.
