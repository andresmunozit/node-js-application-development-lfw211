import { setTimeout } from 'timers/promises'

// Create an instance of `AbortController`
const ac = new AbortController()

// Extract the `AbortSignal` instance from the controller
const { signal } = ac

// Set a timeout and pass the `signal` to it via the options argument, which allows for cancellation
// The API will monitor for an abort event on this `signal`
const timeout = setTimeout(1000, 'will NOT be logged', { signal })

setImmediate(() => {
    // Call the `abort` method to trigger the abort event on the `signal`
    // This cancels the timeout and rejects the promise with an `AbortError`
    ac.abort()
})

// Handle the timeout promise. If aborted, it will throw an `AbortError`
try {
    console.log(await timeout)
} catch (err) {
    // Only rethrow errors that are not due to the abort operation
    if (err.code != 'ABORT_ERR') throw err
}
