'use strict'

// Detect if this process is the child or parent based on the environment variable
const { IS_CHILD } = process.env

if (IS_CHILD) {
    // When executed as a child process, log the current working directory and environment
    console.log('Subprocess cwd:', process.cwd())
    console.log('env', process.env)
} else {
    // For path parsing and extracting file system's root directory
    const { parse } =  require('path')
    const { root } = parse(process.cwd())

    // Importing spawn to create a child process
    const { spawn } = require('child_process')

    // Spawn a child process to execute the same script (this file)
    const sp = spawn(process.execPath,  [__filename],  {
        cwd: root, // Set the child process's current working directory to the file system's root
        env: {IS_CHILD: '1'} // Set environment variable to detect child process in next execution
    })

    // Pipe child's STDOUT to parent's STDOUT to display logs
    sp.stdout.pipe(process.stdout)
}
