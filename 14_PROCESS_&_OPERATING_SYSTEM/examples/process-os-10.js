setInterval(() => {
    console.log('this interval is keeping the process open')
}, 500)
setTimeout(() => {
    console.log('exit after this')
    // Now we pass 1 to `process.exit`
    process.exit(1)
}, 1750)
