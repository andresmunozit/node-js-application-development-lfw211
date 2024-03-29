# THE NODE BINARY

## Introduction
The Node.js platform is almost entirely represented by the node binary executable. In order to
execute a JavaScript program we use: `node app.js`, where `app.js` is the program we wish to run.

## Printing Command Options
```sh
# To see all the command line flags
$ node --help

# There are additional flags for modifying the JavaScript runtime engine: V8
$ node --v8-options

```

## Checking Syntax
It's possible to parse a JavaScript application without running it in order to check the syntax.
```sh
$ node --check app.js

# or 
$ node -c app.js

```

If the code parses successfully, there will be no output, if not the error will be printed.

Consider the apps:
```js
// 03_THE_NODE_BINARY/examples/check-syntax/correct-syntax.js
'use strict'

function f (a, b) {
  
}

```

```js
// 03_THE_NODE_BINARY/examples/check-syntax/bad-syntax.js
'use strict'

function f (a, a) {
  
}

```

```sh
# There is no output when checking correct-syntax.js
$ node -c correct-syntax.js 

$ node --check correct-syntax.js 

# There should be a Syntax error when checking the bad-syntax.js
$ node -c bad-syntax.js 
/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/check-syntax/bad-syntax.js:3
function f (a, a) {
               ^

SyntaxError: Duplicate parameter name not allowed in this context
    at internalCompileFunction (node:internal/vm:73:18)
    at wrapSafe (node:internal/modules/cjs/loader:1176:20)
    at checkSyntax (node:internal/main/check_syntax:67:3)

Node.js v18.15.0

```

## Dynamic Evaluation
Node can directly evaluate code from shell:
```sh
# -p, --print flag evaluates an expression and prints the result
$ node --print "1 + 1"
2

# The following will print the console.log output and undefined wich is the result of that execution
$ node -p "console.log(1+1)"
2
undefined

# -e, --eval flag evaluates without printing the result of the expression
$ node --eval "1 + 1"
# won't print anything

# The following evaluation will print 2, because of console.log is used to explicitly write the
# result to the terminal
$ node -e "console.log(1+1)"
2

```

If a module is required, Node modules can be accessed by their namespaces within the code evaluation
context.
```sh
# For example, the following would print all the files with a .js extension in the current working
# directory
$ node -p "fs.readdirSync('.').filter((f) => /.js$/.test(f))"

```

## Preloading CommonJS Modules
```sh
# -r, --require flag can be used to preload a CommonJS module before anything else loads.
$ cd 03_THE_NODE_BINARY/examples/require-flag 

$ cat preload.js 
console.log('preload.js: this is the preloaded')

$ cat app.js 
console.log('app.js: this is the main file')

$ node -r ./preload.js app.js
preload.js: this is the preloaded
app.js: this is the main file

```

This is useful when we want to configure the process in some way, like injecting environment
variables, one example would be dotenv.

Note that the `--require` flag can only preload a CommonJS module not an ESM modules. ESM modules
have a vaguely related, experimental flag `--loader`.

## Stack Trace Limit
Stack traces are generated by any Error. By default, a stack trace will contain the last ten stack
frames (function call sites), at the point the trace occurred.

The stack trace  limit can be modified with the `--stack-trace-limit-flag`. This flag is part of V8.

Consider the following code:
```js
// 03_THE_NODE_BINARY/examples/stack-trace-limit/app.js
function f(n = 99) {
    // "==" and "===" are both equality operators
    // == performs type coercion if necessary, 1 == '1' is true because '1' is coerced to a number
    // === strict equality comparison, no type coercion will be done
    if (n === 0) throw Error()
    
    f(n - 1)
}

f()

```

```sh
# When executed, the function will be called 100 times. On the 100th time, an Error is thrown and
# the stack for the error will be output to the console.

$ node app.js
/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:5
    if (n === 0) throw Error()
                 ^

Error
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:5:24)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)

Node.js v18.15.0

```

The stack trace output, only shows the call to the f function, in order to see the very first call
to f, the stack trace limit must be set to 101:
```sh
$ node --stack-trace-limit=101 app.js
/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:5
    if (n === 0) throw Error()
                 ^

Error
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:5:24)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
# ...
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at f (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:7:5)
    at Object.<anonymous> (/node-js-application-development-lfw211/03_THE_NODE_BINARY/examples/stack-trace-limit/app.js:10:1)

Node.js v18.15.0

```

The stack trace limit should stay at default in production scenarios due to the overhead involved
with retaining long stacks. It can neverthless be useful for development purposes.

## Knowledge Check
1. Which flag allows a CommonJS module to be preloaded:
- A. --loader
- B. -r or --require [x]
- C. -p or --preload

2. How can the syntax of a program be checked without running it:
- A. node -s app.js or node --syntax app.js
- B. node -c app.js or node --check app.js [x]
- C. node --parse-only app.js
