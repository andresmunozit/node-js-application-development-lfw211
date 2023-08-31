const timeout = setTimeout(() => {
    // This code will output nothing
    console.log('will not be logged')
}, 1000)

// The timeout is cleared before its callback can be called
setImmediate(() => { clearTimeout(timeout) })
