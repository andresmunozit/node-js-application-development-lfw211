class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

async function doTask(amount) {
    return new Promise((resolve, reject) => {
        if (typeof amount !== 'number') {
            reject(new TypeError('amount must be a number'))
            return
        } else if (amount <= 0) {
            reject(new RangeError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        resolve(amount / 2)
    })
}

async function run() {
    // We wrapped the try/catch block in an async function
    try {
        // This time we await `doTask` call, so the async function will handle the returned
        // promise.
        // Since 3 is an odd number, the promise returned from `doTask(3)`, will call `reject` with
        // our custom `OddError`
        const result = await doTask(3)
        console.log('result', result)
    } catch(err) {
        if (err instanceof TypeError) {
            console.error('wrong type')
        } else if (err instanceof RangeError) {
            console.error('out of range')
        // The `catch` block will identify the `code` property and then output "cannot be odd"
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    }
}

run()
