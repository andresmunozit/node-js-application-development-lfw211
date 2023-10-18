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
