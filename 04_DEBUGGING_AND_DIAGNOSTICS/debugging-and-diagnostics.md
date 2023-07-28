# 04. DEBUGGING AND DIAGNOSTICS
To debug a Node.js application, initiate it in Inspect mode, which makes it debuggable, exposes a
remote protocol for connection via tools like Chrome Devtools, and allows additional diagnostic
checks, helping in efficient debugging and profiling.

## Starting in Inspect Mode
Consider the following code:
```js
// 04_DEBUGGING_AND_DIAGNOSTICS/examples/inspect-mode/app.js
function f(n = 99) {
    if (n === 0) throw Error()

    f(n - 1)
}

f()

```

Let's execute it in inspect mode (`--inspect` and `--inspect-brk`):
```sh
# We can use the --inspect flag, in this way the application will be fully initialized and be
# performing asynchronous tasks before any breakpoints can be set.
$ node --inspect app.js
node --inspect app.js
Debugger listening on ws://127.0.0.1:9229/543acd96-45cf-47b1-8807-54d09bbb8c3e
For help, see: https://nodejs.org/en/docs/inspector
/home/andres/code/andresmunozit/node-js-application-development-lfw211/04_DEBUGGING_AND_DIAGNOSTICS/examples/inspect-mode/app.js:2
    if (n === 0) throw Error()
                 ^

Error
    at f (/home/andres/code/andresmunozit/node-js-application-development-lfw211/04_DEBUGGING_AND_DIAGNOSTICS/examples/inspect-mode/app.js:2:24)
# ...
    at f (/home/andres/code/andresmunozit/node-js-application-development-lfw211/04_DEBUGGING_AND_DIAGNOSTICS/examples/inspect-mode/app.js:4:5)

Node.js v18.15.0

# In most cases, is better to cause the process to start with an active breakpoint at the
# very beggining of the program using the --inspect-brk flag:
$ node --inspect-brk app.js
Debugger listening on ws://127.0.0.1:9229/4f268301-71cb-4bfd-bc98-517766d75794
For help, see: https://nodejs.org/en/docs/inspector

```

The remote debugging protocol uses WebSockets which is why ws:// protocol address is printed.

To start the debugging process, the next step is to set a Chrome tab's addresses bar to
chrome://inspect.

This will show the Remote Target section, with the target app.js, and the inspect link to start.

For more information about Chrome Devtools, see
[Google Developer's Documentation](https://developer.chrome.com/docs/devtools/).

## Breaking on Error in Devtools
The "Pause on exceptions" feature can be used to automatically set a breakpoint at the line where an
error is thrown. Go to the "Sources" tab in Chrome Devtools, click the pause button in the top
right.

Ensure the "Pause on caught exceptions" checkbox is unchecked and press the play button, the process
should then pause on line 2 where the error is thrown.
