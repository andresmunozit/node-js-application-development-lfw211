# 02. SETTING UP

## How not to install node
- Installing Node.js through an operating system's package manager (like apt-get, Brew, or
Chocolatey) is not recommended. This is due to the lag in Node.js release cycle updates and
inconsistent placement of binary and config files, leading to potential compatibility issues.

- Using Node's module installer (npm) to install global modules via an OS package manager often
requires sudo (root privileges), which is not ideal from a security perspective and not recommended
for a developer setup.

- Directly installing Node from the Node.js website also necessitates the use of sudo for installing
global libraries on macOS and Linux, which is not ideal.

- Regardless of the OS (Windows, macOS, or Linux), a better way to install Node is by using a
version manager.

## Installing Node.js on macOS and Linux
The recommended way to install Node.js on macOS and Linux is by using a Node version manager, in
particular nvm

The way to install nvm is via the install script available on GitHub: nvm-sh/nvm.
```sh
# -o- option fetch a file from an URL and write the content to the standard output
$ curl -o- htt‌ps://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Or download the script and then execute it on your machine
$ cat install.sh | bash

# To check the installation was successful
# command: Execute a simple command or display information about commands.
$ command --v nvm
nvm

# To install the latest version of Node 18 you can use
$ nvm install 18

# We can verify which version of Node is installed
$ node -v

```
