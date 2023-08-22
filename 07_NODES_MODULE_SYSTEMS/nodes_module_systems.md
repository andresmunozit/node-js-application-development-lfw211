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
// process launched. The `module` variable references the `Module` object.
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

Let's convert the code of `index.js` to the following:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-mjs/index.js
'use strict'

// Is this file the entry script?
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
  // We could have used a callback but we used an `async` function, since dynamic import returns a
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

$ node -p "require('./index')('hello')"
Promise { <pending> }

$ node -e "require('./index')('hello').then(console.log)"
OLLEH

```

Using dynamic import to integrate ESM into CJS altered our API. Now, `reverseAndUpper` returns a
promise, which is a significant change and seems excessive for its purpose.

In the upcoming chapter, we'll delve into asynchronous abstractions. 

## Convert a CJS Package to an ESM Package
We can opt-in to ESM-by-default by adding a `type` field to the `package.json` and setting it to
`module`:
```json
// 07_NODES_MODULE_SYSTEMS/examples/my-package-cjs-to-mjs/package.json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  // Add the `type` field and set it to `module`
  "type": "module",
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

We can rename `format.mjs` to `format.js`:
```sh
$ node -e "fs.renameSync('./format.mjs', 'format.js')"

```

Now let's update the `index.js` file to:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-cjs-to-mjs/index.js
// Importing the required modules and utilities
// In ESM (EcmaScript Modules), you don't need to use the await keyword for top-level imports
// because the ESM system is designed to be asynchronous by default
import { realpath } from 'fs/promises' // Promise-based filesystem API from Node core
import { fileURLToPath } from 'url' // Utility function to convert file:// URLs to paths
import * as format from './format.js' // Import all named exports from `format.js` into a `format`
                                      // object

// Check if this module is the entry module executed by Node
// `process.argv`:Is an array containing the command line arguments passed when the Node.js process was launched
// `process.argv[0]`: Is the path to the Node.js executable itself
// `process.argv[1]`: Is the path to the JavaScript file being executed
const isMain = process.argv[1] &&
  await realpath(fileURLToPath(import.meta.url)) ===  // Convert current module's URL to path and
                                                      // normalize it
  await realpath(process.argv[1]) // Normalize entry file's path

// If this module is the main module being executed
if (isMain) {
  // `await` keyword is mandatory when loading modules conditionally
  const { default: pino } = await import('pino')
  const logger = pino()
  logger.info(format.upper('my-package started')) // Use the "upper" method from format.js
  process.stdin.resume()
}

// Default export of the module - a synchronous function
export default (str) => {
  return format.upper(str).split('').reverse().join('')
}

```

Now we're able to run `npm start` but you also can now `import` our module (within another ESM
module): 
```sh
$ npm start

> my-package@1.0.0 start
> node index.js

{"level":30,"time":1692300939971,"pid":2713412,"hostname":"andres-msi","msg":"MY-PACKAGE STARTED"}

# import
$ echo "import uprev from './index.js'; console.log(uprev('HELLO'))" | node --input-type=module
OLLEH

```

### Notes on the code
1. In ESM, use `export default` to set a function as the main export, unlike CJS's `module.exports`.
2. ESM exports must be declared at the top execution scope.
3. ESM was primarily for browsers, so in Node.js we infer a module as the main one by comparing
`process.argv[1]` and `import.meta.url`.
4. ESM deals with URLs. In Node, `import.meta.url` holds a `file://` URL pointing to the current
module's path.
5. With dynamic imports, the default export must be reassigned, e.g., `{ default: pino }`.
6. Unlike CJS, ESM mandates specifying the full filename (with extension) for imports.
7. `import * as format` loads all named exports from `format.js` into a `format` object.

## Resolving a Module Path in CJS
The `require` function has a method `require.resolve` that can be used to determine the absolute
path for a required module.

Let's create a file in `my-package` (`my-package-require-resolve`) and call it `resolve-demo.cjs`,
with the following code:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-require-resolve/resolve-demo.cjs
'use strict'

console.log()
// `console.group`: Increases indentation of subsequent lines by spaces for `groupIndentationlength`
console.group('* package resolution')
console.log(`require('pino')`, '\t', '=>', require.resolve('pino'))
console.log(`require('standard')`, '\t', '=>', require.resolve('standard'))
console.groupEnd()
console.log()

console.group('* directory resolution')
console.log(`require('.')`, '\t\t', '=>', require.resolve('.'))
console.log(`require('../my-package-require-resolve')`, '\t', '=>', require.resolve('../my-package-require-resolve'))
console.groupEnd()
console.log()

console.group('* file resolution')
console.log(`require('./format')`, '\t\t', '=>', require.resolve('./format'))
console.log(`require('./format.js')`, '\t', '=>', require.resolve('./format.js'))
console.groupEnd()
console.log()

console.group('* core APIs resolution')
console.log(`require('fs')`, '\t', '=>', require.resolve('fs'))
console.log(`require('util')`, '\t', '=>', require.resolve('util'))
console.groupEnd()
console.log()

```

If we execute `resolve-demo.cjs` with `node`, we'll see the resolved path for each of the require
examples:
```sh
$ node resolve-demo.cjs

* package resolution
  require('pino')        => /absolute/path/my-package-require-resolve/node_modules/pino/pino.js
  require('standard')    => /absolute/path/my-package-require-resolve/node_modules/standard/index.js

* directory resolution
  require('.')           => /absolute/path/my-package-require-resolve/index.js
  require('../my-package-require-resolve')       => /absolute/path/my-package-require-resolve/index.js

* file resolution
  require('./format')            => /absolute/path/my-package-require-resolve/format.js
  require('./format.js')         => /absolute/path/my-package-require-resolve/format.js

* core APIs resolution
  require('fs')          => fs
  require('util')        => util

```

## Resolving a Module Path in ESM
Since Node.js has implemented ESM with the ability to load packages, core modules and relative file
paths, the ability to resolve an ESM module is important. Currently there is experimental support
for an `import.meta.resolve` function that returns a promise that resolves to the relevant `file://`
URL. Since this is experimental (behind the flag `--experimental-import-meta-resolve`), we'll
discuss an alternative approach:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-create-require/create-require-demo.js
import { pathToFileURL } from 'url'
import { createRequire } from 'module'

// `import.meta.url`: The absolute `file:` URL of the module
// `createRequire`: Takes a filename and use it to construct a require function
const require = createRequire(import.meta.url)

console.log(
    `import 'pino'`,
    '=>',
    // `pathToFileURL`: This function converts the path to an absolute, properly encoded File URL
    pathToFileURL(require.resolve('pino')).toString()
)

```

Let's run it:
```sh
$ node create-require-demo.js
import 'pino' => file:///absolute/path/my-package-create-require/node_modules/pino/pino.js

```

This solution is partial because of recent Package API called **Conditional Exports**, which lets
packages specify export files for different environments, like CJS and ESM. So if a packages
`package.json` exports field defines an ESM entry point, the `require.resolve` function will still
resolve to the CJS entry point because require is a CJS API.

### Example: `tap`
The `tap` module sets an exports field that points to a `.js` file by default, but a `.mjs` file
when imported. Let's install tap `npm install tap`.

Now let's edit `create-require-demo.js`:
```js
// 07_NODES_MODULE_SYSTEMS/examples/my-package-tap/create-require-demo.js
import { pathToFileURL } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

console.log(
    `import 'pino'`,
    '=>',
    pathToFileURL(require.resolve('pino')).toString()
)

console.log(
    `import 'tap'`,
    '=>',
    // Since `require` is a CJS API, `require.resolve` function will still resolve to the CJS entry
    // point
    pathToFileURL(require.resolve('tap')).toString()
)

```

```sh
$ node  create-require-demo.js
import 'pino' => file:///absolute/path/my-package-tap/node_modules/pino/pino.js
# The `require.resolve('tap')` call returns the path to the default export (lib/tap.js) instead of
# the ESM export (lib/tap.mjs).
import 'tap' => file:///absolute/path/my-package-tap/node_modules/tap/lib/tap.js

```

Let's install: `npm install import-meta-resolve`, now let's create the file
`import-meta-resolve-demo.js`:
```js
import { resolve } from 'import-meta-resolve'

console.log(
    `import 'pino'`,
    '=>',
    await resolve('pino', import.meta.url)
)

console.log(
    `import 'tap'`,
    '=>',
    await resolve('tap', import.meta.url)
)

```

```sh
$ node import-meta-resolve-demo.js
import 'pino' => file:///absolute/path/my-package-tap/node_modules/pino/pino.js
import 'tap' => file:///absolute/path/my-package-tap/node_modules/tap/lib/tap.mjs
# Now tap is resolved to its `.mjs` entry point

```

> Recall that ESM can load CJS but CJS cannot load ESM during initialization.

## Labs
### Lab 7.1 - Creating a Module
The `./labs/labs-1` folder has an `index.js` file. Write a function that takes two numbers and adds
them together, and then export that function from the `index.js` file.

Run `npm test` to check whether `index.js` was correctly implemented. If it was the output
should contain "passed!".

By default, the `./labs/labs-1` folder is set up as a CJS project, but if desired, the
`package.json` can be modified to convert to an ESM module (by either setting the type field to
module or renaming `index.js` to `index.mjs` and setting the type field accordingly). The exercise
can be completed either with the default CJS or with ESM or both.

#### Solution
We're not swtching index to an ESM module because that would break the test at
`7_NODES_MODULE_SYSTEMS/labs/labs-2/test.js`, since `labs-2` depends on `labs-1`.

```js
// 07_NODES_MODULE_SYSTEMS/labs/labs-1/index.js
module.exports = function(a, b) {
    return a + b
}

```


```sh
$ npm test

> labs-1@1.0.0 test
> node test.mjs

passed!

```

### Lab 7.2 - Loading a Module
The `./labs/labs-2` is a sibling to `labs-1`. In the `index.js` file of `./labs/labs-2`, load the
module that was created in the previous lab task and use that module to `console.log` the sum of 19
and 23.

The `./labs/labs-2` folder is set up as a CJS project. Recall that ESM can load CJS but CJS cannot
load ESM during initialization. If the prior exercise was completed as an ESM module it cannot be
synchronously loaded into a CJS module. Therefore if the prior exercise was completed in the
form of an ESM module, this exercise must also be similarly converted to ESM.

When `index.js` is executed with node it should output 42.

Run npm test to check whether `index.js` was correctly implemented. If it was, the output
should contain `"passed!"`:

#### Solution
```js
// 07_NODES_MODULE_SYSTEMS/labs/labs-2/index.js
'use strict'

const add = require('../labs-1')

console.log(add(19, 23))

```

```sh
$ npm  test

> labs-2@1.0.0 test
> node test.js

passed!

```
