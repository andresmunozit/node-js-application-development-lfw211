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
// 07_NODES_MODULE_SYSTEMS/examples/my-package/index.js
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

// `upper` function will convert any input to a string and then that string to an upper-cased
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
// 07_NODES_MODULE_SYSTEMS/examples/my-package/format.js

'use strict'
// The `format.js` file is loaded. The extension (.js) is allowed but not necessary.
// `require('./format')` will return the `module.exports` value in `format.js` (an object that has
// an `upper` method)
const format = require('./format') // `format` is a local module

const pino = require('pino') // `pino` is a package module
const logger = pino()

// `format` is an object with an `upper` method
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

// https://nodejs.org/api/modules.html#requiremain
// `require.main`: Is the `Module` object representing the entry script loaded when the Node.js
// process launched. `module` variable references the `Module` object.
if (require.main === module) {
  const pino = require('pino')
  const logger = pino()
  logger.info(format.upper('my-package started'))
  process.stdin.resume()
// ...`undefined` if the entry point of the program is not a CommonJS module, for example when the
// module is required instead of being a script run with Node.js
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

## Converting a Local CJS File to a Local ESM File
EcmaScript Modules (ESM) were added to EcmaScript in 2015, aiming for browsers to easily *pre-parse*
imports like they do with `<script>` tags. *Pre-parsing* is the early analysis of code before its
full execution, enabling optimizations like quicker loading or error spotting.

Implementing ESM took time in browsers and even longer in Node.js due to compatibility issues with
Node's older CommonJS (CJS) system. While CJS loads modules synchronously, ESM loads them
asynchronously, fitting browser needs.

Beware of "faux-ESM", which looks like ESM but acts differently. It's transpiled to act synchronous,
whether in Node or browsers.
 
Node apps can have both CJS and ESM files.

Let's convert our format.js file from CJS to ESM. First we'll need to rename so that it has an
`.mjs` extension:
```sh
$ node -e "fs.renameSync('./format.js', './format.mjs')"
$ node -p "fs.readdirSync('.').join('\t')"
.gitignore      format.mjs      index.js        node_modules    package.json

```

Later, we'll explore converting a project to ESM, allowing `.js` extensions for ESM and requiring
`.cjs` for CJS files. Currently, we're changing one CJS file to ESM.

Whereas CJS modifies a `module.exports` object, ESM introduces native syntax. To create a 
*named export*, we just use the `export` keyword in front of an assignment (or function
declaration).

Let's update the `format.mjs` code to the following:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-mjs/format.mjs

// We no longer need the 'use strict' pragma since ESM modules essentially execute in strict-mode
// anyway.
export const upper = (str) => {
    if (typeof str === 'symbol') str = str.toString()
    str += ''
    return str.toUpperCase()
}

```

If we now try to execute `npm start` we'll see the following failure:
```sh
$ npm start

> my-package@1.0.0 start
> node index.js

node:internal/modules/cjs/loader:1078
  throw err;
  ^

Error: Cannot find module './format'
Require stack:
- /.../my-package-mjs/index.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1075:15)
    at Module._load (node:internal/modules/cjs/loader:920:27)
# ...

```

This error occurs because `require` function will not automatically resolve a filename without an
extension (`./format`) to an `.mjs` extension. There is no point fixing this, since attempting to
require the ESM file will fail anyway:
```sh
$ node -e "require('./format.mjs')"
node:internal/modules/cjs/loader:1115
    throw new ERR_REQUIRE_ESM(filename, true);
    ^

Error [ERR_REQUIRE_ESM]: require() of ES Module /../my-package-mjs/format.mjs not supported.
Instead change the require of /..my-package-mjs/format.mjs to a dynamic import() which is available in all CommonJS modules.
    at [eval]:1:1
    at Script.runInThisContext (node:vm:129:12)
    at Object.runInThisContext (node:vm:307:38)
    at [eval]-wrapper:6:22 {
  code: 'ERR_REQUIRE_ESM'
}

Node.js v18.15.0

```

Our project is broken.

## Dynamically Loading an ESM Module in CJS
Synchronous and asynchronous module loading differ. While ESM can include CJS, CJS can't directly
use ESM because of its synchronous nature. To be compatible, modules should offer a CJS interface,
however, ESM is JavaScript's built-in module system.

ESM can be loaded into CJS using dynamic import, but this has implications.

Let's convert the code of index.js to the following:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-mjs/index.js
'use strict'

if (require.main === module) {
  const pino = require('pino')
  const logger = pino()

  // Dynamic import can be fine in this case (we log out and resume STDIN), the only impact is that
  // the code takes slightly longer to execute
  import('./format.mjs').then((format) => {
    logger.info(format.upper('my-package started'))
    process.stdin.resume()
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })
} else {
  // In this branch we had to convert a synchronous function to use an asynchronous abstraction
  // We could have used a callback but we used an `async` function, since dynamicc import returns a
  // promise, we can `await` it
  let format = null
  const reverseAndUpper = async (str) => {
    format = format || await import('./format.mjs')
    return format.upper(str).split('').reverse().join('')
  }
  module.exports = reverseAndUpper
}


```

We should see the correct result now when run `npm start`:
```sh
$ npm start

> my-package@1.0.0 start
> node index.js

{"level":30,"time":1692117109603,"pid":26554,"hostname":"andres-msi","msg":"MY-PACKAGE STARTED"}

```

In the upcoming chapter, we'll delve into asynchronous abstractions. Using dynamic import to
integrate ESM into CJS altered our API. Now, `reverseAndUpper` returns a promise, which is a
significant change and seems excessive for its purpose.
