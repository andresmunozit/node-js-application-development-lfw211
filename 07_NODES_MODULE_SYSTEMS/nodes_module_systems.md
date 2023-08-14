# NODE'S MODULE SYSTEM
In Node.js, a module is a chunk of code. You can divide code into modules and combine them.
Packages contain modules, and modules provide functions. Files can also be modules in Node.js.
This section teaches how to create and load modules and briefly compares the newer EcmaScript
Modules (ESM) with the older CommonJS (CJS) system.

## Loading a Module with CJS
Let's duplicate the same example from the previous chapter:
```json
// 07_NODES_MODULE_SYSTEMS/examples/my-package/package.json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint":  "standard"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "pino": "^7.11.0"
  },
  "devDependencies": {
    "standard": "^17.1.0"
  }
}

```

```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package/index.js
'use strict'
console.log('my-package started')
process.stdin.resume()

```

Install the dependencies using `npm install`.

Let's replace the `console.log` statement in our `index.js` file with a logger that we instantiate
from the Pino module:
```js
// s07_NODES_MODULE_SYSTEMS/examples/my-package/index.js
'use strict'
// When we require the Pino module we assign the value returned from require to the constant: `pino`
const pino = require('pino')
// Now the Pino module has been loaded using require

// In this case the Pino module exports a function, so `pino` references a function that creates a
// logger
const logger = pino()

logger.info('my-package started')
process.stdin.resume()

```

The `require` function is passed a package's namespace, looks for a directory with that name in the
`node_modules` folder and returns the exported value from the main file of that package.

Not let's run `npm start`:
```sh
$ npm start

> my-package@1.0.0 start
> node index.js

{"level":30,"time":1692035696911,"pid":3564871,"hostname":"andres-msi","msg":"my-package started"}
# Hit CTRL-C to exit the process

```

## Creating a CJS Module
The `require` function will return whatever is exported from a module, in the case of Pino it was a
function.

Let's create a file called `format.js` in the `my-package` folder:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package/format.js
'use strict'

// `upper` function will convert any input to a string and then tthat string to an upper-cased
// string
const upper = (str) => {
    if (typeof str === 'symbol') str = str.toString()
    str += ''
    return str.toUpperCase()
}

// Whatever is assigned to `module.exports` will be the value returned when the module is required
module.exports =  { upper: upper }

```

The `format.js` file can now be loaded into our `index.js` file as a local module:
```js
'use strict'
// The `format.js` file is loaded. The extension (.js) is allowed but not necessary.
// `require('./format')` will return the `module.exports` value in `format.js` (an object that has
// an `upper` method)
const format = require('./format') // `format` is a local module

const pino = require('pino') // `pino` is a package module
const logger = pino()

// `format` is 
logger.info(format.upper('my-package started'))
process.stdin.resume()

```

```sh
# Let's execute the application
$ npm start

> my-package@1.0.0 start
> node index.js

{"level":30,"time":1692037588339,"pid":3592899,"hostname":"andres-msi","msg":"MY-PACKAGE STARTED"}

```

## Detecting Main Module in CJS
The `start` script in `package.json` executes `node index.js`. When a file is called with node, that
is the entry point of a program. So currently `my-package` is behaving more like an application or
service than a package.

If we `require` the `index.js` it will behave the same way:
```sh 
$ node -e "require('./index.js')"
{"level":30,"time":1692038275278,"pid":3603399,"hostname":"andres-msi","msg":"MY-PACKAGE STARTED"}

```

In some situations we may want a module to be able to operate both as a program and as a module that
can be loaded into other modules.

When a file is the entry point of a program, it's the main module. We can detect whether a
particular file is the main module.

Let's modify the `index.js` file to the following:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package/index.js
'use strict'
const format = require('./format')

// The Module object is the main script that starts when Node.js runs. If the entry point isn't a
// CommonJS module, then it's undefined.
if (require.main === module) {
  const pino = require('pino')
  const logger = pino()
  logger.info(format.upper('my-package started'))
  process.stdin.resume()
} else {
  const reverseAndUpper = (str) => {
    return format.upper(str).split('').reverse().join('')
  }
  module.exports = reverseAndUpper
}

```

Now the `index.js` file has two operational modes.


If it's executed with node, it will exhibit the original behavior:
```sh
$ node index.js                           
{"level":30,"time":1692039100715,"pid":3615784,"hostname":"andres-msi","msg":"MY-PACKAGE STARTED"}

```

If it is loaded as a module, it will export a function that reverses and upper-cases a string:
```sh
$ node -p "require('./index.js')('hello')"
OLLEH

```
