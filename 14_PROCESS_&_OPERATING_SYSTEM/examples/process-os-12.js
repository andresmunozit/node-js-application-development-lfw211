'use strict'
setInterval(() => {
    console.log('this interval is keeping the process open')
    process.exitCode = 1
}, 500)
setTimeout(() => {
    console.log('exit after this')
    process.exit()
}, 1750)
process.on('exit', (code) => {
    console.log('exiting with code', code)
    setTimeout(() => {
        // No asynchronous work can be done because the process is exiting
        console.log('this will never happen')
    }, 1)
})
