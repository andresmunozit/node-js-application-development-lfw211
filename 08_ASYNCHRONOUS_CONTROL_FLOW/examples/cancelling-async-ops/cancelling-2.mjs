import { setTimeout } from 'timers/promises'

// The imported `setTimeout` function doesn't need a callback, instead it returns a promise that
// resolves after the specified delay. Optionally, the promise resolves to the value of the second
// argument
const timeout = setTimeout(1000, 'will be logged')

setImmediate(() => {
    // Since `timeout` variable is a promise and not a timeout identifier, `clearTimeout` ignores it
    // so the asynchronous timeout operation never gets cancelled
    clearTimeout(timeout)
})

// Then we log the resolved promise
console.log(await timeout)
