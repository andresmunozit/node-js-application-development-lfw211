# 06. PACKAGES AND DEPENDENCIES

## The `npm` Command
The npm command is a CLI tool that acts a package manager for Node.js. When Node.js is installed,
the `node` binary and the `npm` executable are both installed. By default it points to `npmjs.com`,
which is the default module registry.
```sh
# General help
$ npm help

# Particular command help
$ npm install -h

```

## Initializing a package
A package is a folder with a `package.json` file and some code.

`npm init` command can be used to quickly create a `package.json` file in the directory it's called
in:
```sh
# Just press enter of all the questions
$ npm init
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (my-package) 
version: (1.0.0) 
description: 
entry point: (index.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
About to write to /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package/package.json:

{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}


Is this OK? (yes) 

```

The default fields in a generated `package.json` file are:
- `name`: the name of the package
- `version`: the current version number of the package
- `description`: a package description, this is used for meta analysis in package registries
- `main`: the entry-point file to load when the package is loaded
- `scripts`: namespaced shell scripts, these will be discussed lated in this section
- `keywords`: array of keywords, imroves discoverability of a published package
- `author`: the package author
- `license`: the package license

In a folder with `package.json`, running `npm init` updates it. If it's also a git project with a
remote repo, npm `init -y` will auto-fill the remote URL from git into package.json.

## Installing Dependencies
Once a folder has a package.json  file, dependencies can be installed using `npm install pino` 
(`pino` is a logger):
```sh
# Running npm install pino without specifying a version will install the latest version of the
# package
$ npm install pino 

added 23 packages, and audited 24 packages in 2s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

After the installation, this will be the new content of `package.json`:
```json
// 06_PACKAGES_AND_DEPENDENCIES/examples/my-package/package.json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  // The new `dependencies` field has been created, it will contain dependency namespaces (pino in
  // the case of the example), which values contain the Semver range version number (more on Semver)
  // later
  "dependencies": {
    "pino": "^8.15.0"
  }
}

```

For this example we are going to install the latest major number version 7:
```sh
$ npm install pino@7

added 7 packages, removed 7 packages, changed 9 packages, and audited 24 packages in 1s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

The dependencies object has changed:
```json
// 06_PACKAGES_AND_DEPENDENCIES/examples/my-package/package.json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "pino": "^7.11.0" // The major version is 7 now
  }
}

```

In addition, a `node_modules` folder and a `package-lock.json` file will have been added to the
`my-package` folder:
```sh
$ node -p "fs.readdirSync('.').join('\t')"
node_modules    package-lock.json       package.json

```

### package-lock.json
The `package-lock.json` file ensures consistent dependency versions during `npm` installs. While
beneficial for nearing-release applications, it might be restrictive during early development or
module creation, where using the latest dependencies might be preferred. To stop automatic
generation of `package-lock.json`, we can create the `.npmrc` file and set `package-lock` to false
```sh
# This appends package-lock=false to the .npmrc file in the user home directory
$ node -e "fs.appendFileSync(path.join(os.homedir(), '.npmrc'), '\npackage-lock=false\n')"

```

To manually generate a `package-lock.json` we can use `npm install --package-lock`.

It's important to understand that dependencies have to be manually upgraded (even for patch and
minor) if a `package-lock.json` is present. Whether to use the default package-lock behavior will
depends on **context** and **preference** of each project.

### node_modules
The `node_modules` folder contains the logger package, along with all the packages in its dependency
tree.
```sh
$ node -p "fs.readdirSync('node_modules').join('\t')"

.bin    .package-lock.json      atomic-sleep    duplexify       end-of-stream   fast-redact
inherits        on-exit-leak-free       once    pino    pino-abstract-transport
pino-std-serializers    process-warning quick-format-unescaped  readable-stream       
real-require    safe-buffer     safe-stable-stringify   sonic-boom      split2stream-shift    
string_decoder  thread-stream   util-deprecate  wrappy

```

The `npm install` command tries to put all package dependencies at the top level of the
`node_modules` folder. If there are conflicting versions of a package, it might create nested
`node_modules` folders to store them separately.

Te `npm ls` command can be used to describe the **top level** of dependency tree of a package:
```sh
$ npm ls 

my-package@1.0.0 /.../my-package
└── pino@7.11.0

```

The `--depth` flag must be set to a high number to output more than top level dependencies:
```sh
$ npm ls --depth=999
my-package@1.0.0 /.../my-package
└─┬ pino@7.11.0
  ├── atomic-sleep@1.0.0
  ├── fast-redact@3.3.0
  ├── on-exit-leak-free@0.2.0
  ├─┬ pino-abstract-transport@0.5.0
  │ ├─┬ duplexify@4.1.2
  │ │ ├─┬ end-of-stream@1.4.4
  │ │ │ └─┬ once@1.4.0
  │ │ │   └── wrappy@1.0.2
  │ │ ├── inherits@2.0.4
  │ │ ├─┬ readable-stream@3.6.2
  │ │ │ ├── inherits@2.0.4 deduped
  │ │ │ ├─┬ string_decoder@1.3.0
  │ │ │ │ └── safe-buffer@5.2.1
  │ │ │ └── util-deprecate@1.0.2
  │ │ └── stream-shift@1.0.1
  │ └── split2@4.2.0
  ├── pino-std-serializers@4.0.0
  ├── process-warning@1.0.0
  ├── quick-format-unescaped@4.0.4
  ├── real-require@0.1.0
  ├── safe-stable-stringify@2.4.3
  ├─┬ sonic-boom@2.8.0
  │ └── atomic-sleep@1.0.0 deduped
  └─┬ thread-stream@0.15.2
    └── real-require@0.1.0 deduped

```

Now that we have the dependency, we can use it:
```sh
$ node -e "require('pino')().info('testing')"

{"level":30,"time":1691605481466,"pid":1499072,"hostname":"andres-msi","msg":"testing"}

```

Adding the installed dependency to `package.json` file make the `node_modules` disposable. Let's
delete the `node_modules` folder:
```sh
$ node -p "fs.readdirSync('.').join('\t')"
node_modules    package-lock.json       package.json

$ node -e "fs.rmSync('node_modules', { recursive: true })"

$ node -p "fs.readdirSync('.').join('\t')"
package-lock.json       package.json

# If we run `npm ls` it won't print out the same tree anymore, but it will warn that the dependency
# should be installed
$ npm ls

npm ERR! code ELSPROBLEMS
npm ERR! missing: pino@^7.11.0, required by my-package@1.0.0
my-package@1.0.0 /.../my-package
└── UNMET DEPENDENCY pino@^7.11.0


npm ERR! A complete log of this run can be found in:
npm ERR!     /home/andres/.npm/_logs/2023-08-09T18_35_08_984Z-debug-0.log


# To install the dependencies present in `package.json` file, run npm install  without specifying
# a dependency namespace
$ npm install

added 23 packages, and audited 24 packages in 2s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

# Logger has been installed again
$ npm ls --depth=999

my-package@1.0.0 /.../my-package
└─┬ pino@7.11.0
  ├── atomic-sleep@1.0.0
  ├── fast-redact@3.3.0
  ├── on-exit-leak-free@0.2.0
  ├─┬ pino-abstract-transport@0.5.0
  │ ├─┬ duplexify@4.1.2
  │ │ ├─┬ end-of-stream@1.4.4
  │ │ │ └─┬ once@1.4.0
  │ │ │   └── wrappy@1.0.2
  │ │ ├── inherits@2.0.4
  │ │ ├─┬ readable-stream@3.6.2
  │ │ │ ├── inherits@2.0.4 deduped
  │ │ │ ├─┬ string_decoder@1.3.0
  │ │ │ │ └── safe-buffer@5.2.1
  │ │ │ └── util-deprecate@1.0.2
  │ │ └── stream-shift@1.0.1
  │ └── split2@4.2.0
  ├── pino-std-serializers@4.0.0
  ├── process-warning@1.0.0
  ├── quick-format-unescaped@4.0.4
  ├── real-require@0.1.0
  ├── safe-stable-stringify@2.4.3
  ├─┬ sonic-boom@2.8.0
  │ └── atomic-sleep@1.0.0 deduped
  └─┬ thread-stream@0.15.2
    └── real-require@0.1.0 deduped

```

> The `node_modules` folder should not be checked into git, `package.json` should be the source of
truth

## Development Dependencies
When you use `npm install [dependency]` without flags, it adds the dependency to the "dependencies"
section in `package.json`. Some dependencies are just for development, not production, and these are
called "development dependencies".

Only top level *development dependencies* are installed, not the *development dependencies* for
sub-dependencies.

Dependencies and development dependencies can be viewed in the Dependency tab of any given package
on npmjs.com, see an example for [pino](https://www.npmjs.com/package/pino?activeTab=dependencies).
```sh
# We can see that only the production dependencies are installed 
$ npm ls --depth=999

my-package@1.0.0 /.../my-package
└─┬ pino@7.11.0
  ├── atomic-sleep@1.0.0 # `atomic-sleep` dependency appears twice
  ├── fast-redact@3.3.0
  ├── on-exit-leak-free@0.2.0
  ├─┬ pino-abstract-transport@0.5.0
  │ ├─┬ duplexify@4.1.2
  │ │ ├─┬ end-of-stream@1.4.4
  │ │ │ └─┬ once@1.4.0
  │ │ │   └── wrappy@1.0.2
  │ │ ├── inherits@2.0.4
  │ │ ├─┬ readable-stream@3.6.2
  │ │ │ ├── inherits@2.0.4 deduped
  │ │ │ ├─┬ string_decoder@1.3.0
  │ │ │ │ └── safe-buffer@5.2.1
  │ │ │ └── util-deprecate@1.0.2
  │ │ └── stream-shift@1.0.1
  │ └── split2@4.2.0
  ├── pino-std-serializers@4.0.0
  ├── process-warning@1.0.0
  ├── quick-format-unescaped@4.0.4
  ├── real-require@0.1.0
  ├── safe-stable-stringify@2.4.3
  ├─┬ sonic-boom@2.8.0
  │ └── atomic-sleep@1.0.0 deduped # `atomic-sleep` dependency appears twice
  └─┬ thread-stream@0.15.2
    └── real-require@0.1.0 deduped

```

Notice how the `atomic-sleep` sub-dependency occurs twice in the output. The `atomic-sleep` module
is a dependency of `pino` and its direct dependency `sonic-boom`, which allows `npm` to place a
single `atomic-sleep` package in the `modules` folder.

Let's install the `standard` linter as a development dependency into `my-package`:
```sh
$ npm install --save-dev standard

added 220 packages, and audited 244 packages in 7s

94 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

Now let's take a look to the `package.json` file:
```json
{
  // 06_PACKAGES_AND_DEPENDENCIES/examples/my-package/package.json
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "pino": "^7.11.0"
  },
  // The `devDependencies` object has been added to `the package.json` file
  "devDependencies": {
    "standard": "^17.1.0"
  }
}

```

```sh
# A much larger dependency tree is revelaed
$ npm ls --depth=999
my-package@1.0.0 /.../my-package
├─┬ pino@7.11.0
│ ├── atomic-sleep@1.0.0
│ ├── fast-redact@3.3.0
│ ├── on-exit-leak-free@0.2.0
│ ├─┬ pino-abstract-transport@0.5.0
│ │ ├─┬ duplexify@4.1.2
│ │ │ ├─┬ end-of-stream@1.4.4
│ │ │ │ └─┬ once@1.4.0
│ │ │ │   └── wrappy@1.0.2
│ │ │ ├── inherits@2.0.4
│ │ │ ├─┬ readable-stream@3.6.2
│ │ │ │ ├── inherits@2.0.4 deduped
│ │ │ │ ├─┬ string_decoder@1.3.0
│ │ │ │ │ └── safe-buffer@5.2.1
│ │ │ │ └── util-deprecate@1.0.2
│ │ │ └── stream-shift@1.0.1
│ │ └── split2@4.2.0
│ ├── pino-std-serializers@4.0.0
│ ├── process-warning@1.0.0
│ ├── quick-format-unescaped@4.0.4
│ ├── real-require@0.1.0
│ ├── safe-stable-stringify@2.4.3
│ ├─┬ sonic-boom@2.8.0
│ │ └── atomic-sleep@1.0.0 deduped
│ └─┬ thread-stream@0.15.2
│   └── real-require@0.1.0 deduped
└─┬ standard@17.1.0
  ├─┬ eslint-config-standard-jsx@11.0.0
  │ ├── eslint-plugin-react@7.33.1 deduped
  │ └── eslint@8.46.0 deduped
# ...
  │ │   └── type-fest@0.3.1
  │ └── xdg-basedir@4.0.0
  └── version-guard@1.1.1

```

We don't want to install any dependencies that aren't required in production:
```sh
# The `--omit=dev` flag can be used to ignore development dependencies

# Let's remove the modules folder
$ node -e "fs.rmSync('node_modules', {recursive: true})"

# Let's ignore development dependencies for the following installation
$ npm install --omit=dev

added 23 packages, and audited 24 packages in 6s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

# Only `pino` will be installed when `--omit=dev` is used because standard is `specified` as a
# development dependency in the package.json. This can be verified
$ npm ls --depth=999

npm ERR! code ELSPROBLEMS
npm ERR! missing: standard@^17.1.0, required by my-package@1.0.0
my-package@1.0.0 /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package
├─┬ pino@7.11.0
│ ├── atomic-sleep@1.0.0
│ ├── fast-redact@3.3.0
│ ├── on-exit-leak-free@0.2.0
│ ├─┬ pino-abstract-transport@0.5.0
│ │ ├─┬ duplexify@4.1.2
│ │ │ ├─┬ end-of-stream@1.4.4
│ │ │ │ └─┬ once@1.4.0
│ │ │ │   └── wrappy@1.0.2
│ │ │ ├── inherits@2.0.4
│ │ │ ├─┬ readable-stream@3.6.2
│ │ │ │ ├── inherits@2.0.4 deduped
│ │ │ │ ├─┬ string_decoder@1.3.0
│ │ │ │ │ └── safe-buffer@5.2.1
│ │ │ │ └── util-deprecate@1.0.2
│ │ │ └── stream-shift@1.0.1
│ │ └── split2@4.2.0
│ ├── pino-std-serializers@4.0.0
│ ├── process-warning@1.0.0
│ ├── quick-format-unescaped@4.0.4
│ ├── real-require@0.1.0
│ ├── safe-stable-stringify@2.4.3
│ ├─┬ sonic-boom@2.8.0
│ │ └── atomic-sleep@1.0.0 deduped
│ └─┬ thread-stream@0.15.2
│   └── real-require@0.1.0 deduped
└── UNMET DEPENDENCY standard@^17.1.0


npm ERR! A complete log of this run can be found in:
npm ERR!     /home/andres/.npm/_logs/2023-08-10T22_08_08_675Z-debug-0.log

```

We can ignore the error message since we omitted the development dependency deliberately.

Earlier versions of `npm` supported the same functionality with the `--production` flag, which is
still supported but deprecated.

## Understanding Semver
A SemVer is basically three numbers separated by dots. A version number is updated when a change was
made to the package. The three numbers separated by dots represent different types of change:

- **MAJOR**: The left most number. It means that the change breaks an API or a behavior
- **MINOR**: Is the middle number. It means that the package has been extended, for example a new
method, but it's fully backwards compatible
- **PATCH**: Is the right most number. It means that there has been a bug fix.

More information at [SemVer's website](https://semver.org/).

A SemVer range allows for flexible versioning strategy. One way is to use the character "x" in any
of the `MAJOR.MINOR.PATCH` positions, for example:
- `1.2.x` will match all `PATCH` numbers
- `1.x.x` will match all `MINOR` and `PATCH` numbers

Another way for defining a SemVer range is use the caret (^):
- Using a caret on version numbers is basically the same as using an "x" in the `MINOR` and `PATCH`
positions (for example `1.x.x`)
- There are exceptions when using 0: `^0.0.0` is not the same as `0.x.x`. See
[this docs](https://github.com/npm/node-semver#caret-ranges-123-025-004).

Let's see the `dependencies` and `devDependencies` fields of the `package.json` file:
```json
{
// ...
  "dependencies": {
    "pino": "^7.11.0"
  },
  "devDependencies": {
    "standard": "^17.1.0"
  }
}
// ...

```

## Package Scripts
The `scripts` field in `package.json` can be used to define aliases for shell commands that are
relevant to a Node.js project.

Let's update the scripts property to add a script:
```json
{
  // ...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",

    // Let's add a new script
    "lint": "standard"
  },
  // ...
}

```

`standard` is a code linter installed previously as a development dependency. See
[standard's docs](https://standardjs.com/) for more details.

Packages can define a `bin` field in their `package.json`, which will associate a namespace with a
Node program script within that package. For the case of standard:
```json
// This is the standard package `package.json` file
{
  "name": "standard",
  "description": "JavaScript Standard Style",
  "version": "17.1.0",
  "author": {
    "name": "Feross Aboukhadijeh",
    "email": "feross@feross.org",
    "url": "https://feross.org"
  },
  "bin": {
    // This will associate the `namespace` standard with the Node script `bin/cmd.cjs` 
    "standard": "bin/cmd.cjs"
  },
  //  ....
}

```

This is the content of the Node program scipt for `standard`:
```js
#!/usr/bin/env node

require('version-guard')('../lib/cli.js', 12, 22)

```

Following with the `lint` script example, let's create some code to be able to lint it:
```js
// 06_PACKAGES_AND_DEPENDENCIES/examples/my-package/index.js
'use strict';
console.log('my-package started');
proccess.stdin.resume();

```

```sh
# let's install all the dependencies running `npm install` then 
$ npm install

# To execute the `lint` script run `npm run`
$ npm run lint
> my-package@1.0.0 lint
> standard

standard: Use JavaScript Standard Style (https://standardjs.com)
standard: Run `standard --fix` to automatically fix some problems.
  /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package/index.js:1:13: Extra semicolon. (semi)
  /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package/index.js:2:34: Extra semicolon. (semi)
  /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package/index.js:3:23: Extra semicolon. (semi)

# We have lint errors, let's fix them by using the `--fix` flag, we can use a double dash (--) to
# pass flags via `npm run` to the aliased command
$ npm run lint -- --fix

> my-package@1.0.0 lint
> standard --fix

# As a result the `index.js` file was aletered according to the lint rules, and saved.
$ node -p "fs.readFileSync('index.js').toString()" 
'use strict'
console.log('my-package started')
process.stdin.resume()

```

There are two package scripts that have dedicated npm commands: `npm test` and `npm start`.
```sh
# Let's execute the `npm test` script that was created automatically during `npm init -y`
$ npm test
> my-package@1.0.0 test
> echo "Error: no test specified" && exit 1

Error: no test specified

# Given the `test` script, the output is expected.

```

The `npm test` command is an alias for `npm run test`, this aliases only applies to `test` and
`start` scripts:
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint":  "standard",
    // Let's create the start script
    "start": "node index.js"
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

Let's execute the `start` script, using the node `start alias`:
```sh
$ npm start
npm start

> my-package@1.0.0 start
> node index.js

my-package started

# Press Ctrl + C to exit

```

## Labs
### Lab 6.1 - Install a Development Dependency
The `./labs/labs-1` folder has a package.json file in it. Install `nonsynchronous`
([https://www.npmjs.com/package/nonsynchronous]) as a development dependency.

Run `npm test` in the `labs-1` folder to check that the task has been completed.

If the output says "passed" then the task was completed correctly.

Solution:
```sh
$ npm install nonsynchronous --save-dev

added 3 packages, and audited 4 packages in 2s

found 0 vulnerabilities

$ npm test

> labs-1@1.0.0 test
> node test

passed

```

### Lab 6.2 - Install a Dependency Using a Semver Range
The `./labs/labs-2` folder contains a `package.json` file.

Install the following dependencies at the specified version ranges, and ensure that those ranges
are correctly specified in the `package.json` file:

- Install `fastify` at greater than or equal to `2.0.0`, while accepting all future MINOR and
PATCH versions
- Install `rfdc` at exactly version `1.1.3`

Run `npm install` to install the development dependency required to validate this exercise,
and then run npm test in the `./labs/labs-2` folder to check that the task has been completed:

Solution:
```json
// 06_PACKAGES_AND_DEPENDENCIES/labs/labs-2/package.json
{
  "name": "labs-2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "node test"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    // This is correct, no changes are required
    "fastify": "^2.0.0",
    "rfdc": "1.1.3",
    "semver": "^7.3.4"
  }
}

```

```sh
$ npm install
# ok

$ npm npm test 

> labs-2@1.0.0 test
> node test

passed

```

## Knowledge Check
### Question 6.1
Which of the following cases would all be covered in a SemVer range of `^2.1.2`?
- A. 2.14.2, 2.1.1, 2.11.14
- B. 2.14.2, 2.16.1, 2.14.4 [x]
- C. 2.18.6, 3.13.3, 2.1.3

### Question 6.2
Given two "scripts" fields in the `package.json` file named "test" and "lint", which of the
following commands would execute both scripts?
- A. npm test && npm lint
- B. npm run test lint
- C. npm run lint && npm test [x]

### Question 6.3
If a *package dependency* has a *development dependency*, in what scenario, if any, will the
development dependency be installed?
- A. When running npm install inside the package folder
- B. Never [x]
- C. When running npm install --production inside the package folder
