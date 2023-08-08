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
in.

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
