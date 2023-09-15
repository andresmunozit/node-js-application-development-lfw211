class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    // Instead of returning a promise in which we explicitly call `reject`, we throw right after
    // each error
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

// This allows the possibility of doTask to perform asynchronous tasks
async function run() {
    try {
        // When an error is thrown the program is interrupted and the runtime starts looking for a
        // catch block to handle the error.
        const result = await doTask(3)
        console.log('result', result)
    } catch(err) {
        if (err instanceof TypeError) {
            console.error('wrong type')
        } else if (err instanceof RangeError) {
            console.error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    }

    // In case that a `catch` block was not found in the current execution stack, then the program
    // crashes, and Node.js prints the error stack trace to the console
}

run()
