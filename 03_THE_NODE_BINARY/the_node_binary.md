# THE NODE BINARY

## Introduction
The Node.js platform is almost entirely represented by the node binary executable. In order to
execute a JavaScript program we use: node app.js, where app.js is the program we wish to run.

## The Node Binary

### Printing Command Options
```sh
# To see all the command line flags
$ node --help

# There are additional flags for modifying the JavaScript runtime engine: V8
$ node --v8-options

```

### Checking Syntax
It's possible to parse a JavaScript application without running it in order to check the syntax.
```sh
$ node --check-app app.js

# or 
$ node -c app.js

```

If the code parses successfully, there will be no output, if not the error will be printed.

### Dynamic Evaluation
Node can directly evaluate code from shell:
```sh
# -p, --print flag evaluates an expression and prints the result
$ node --print "1 + 1"
2

# The following will print the console.log output and undefined wich is the result of that execution
node -p "console.log(1+1)"

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
