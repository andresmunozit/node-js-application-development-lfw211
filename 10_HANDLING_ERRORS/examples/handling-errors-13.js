class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    // The returned promise is created using the `Promise` constructor.
    // The function passed to `Promise` is called the *tether* function, it takes two arguments,
    // `resolve` and `reject` which are also functions.
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            // We call `reject` when the operation is a failure
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount <= 0) {
            // We're passing an error into `reject` for each of our error cases so that the returned
            // promise will reject when `doTask` is passed invalid input.
            reject(new ReferenceError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        // We call `resolve` when the operation is a success
        resolve(amount / 2)
    })
}

// Calling doTask with an invalid input, as in the above, will result in an unhandled rejection
doTask(3)
