'use strict'
setInterval(() => {
    console.log('this interval is keeping the process open')
}, 500)
setTimeout(() => {
    console.log('exit after this')
    process.exit()
}, 1750)
