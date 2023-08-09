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
Once a folder has a package.json  file, dependencies can be installed using `npm install pino` (pino
is a logger):
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

The dependencies object have changed:
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
depends on **context** and **preference**.

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

my-package@1.0.0 /home/andres/code/andresmunozit/node-js-application-development-lfw211/06_PACKAGES_AND_DEPENDENCIES/examples/my-package
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

> The `node_modules` folder should not be checked into git, the package.json should be the source of
truth
