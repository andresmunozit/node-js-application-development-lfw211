'use strict'
const { exec } = require('child_process')
const { join } = require('path')

function exercise(myEnvVar) {
    // TODO return a child process with
    // a single environment variable set 
    // named MY_ENV_VAR. The MY_ENV_VAR 
    // environment variable's value should 
    // be the value of the myEnvVar parameter 
    // passed to this exercise function
    return exec(
        `"${process.execPath}" "${join(__dirname, 'child.js')}"`,
        // Options object should be the second argument. A callback function, with the format
        // `(err, stdout, stderr)`, can be the third argument if needed.
        {
            env: {MY_ENV_VAR: myEnvVar}
        }
    )
}

module.exports = exercise
