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
            reject(new ReferenceError('amount must be greater than zero'))
            return
        } else if (amount % 2) {
            reject(new OddError('amount'))
            return
        }
        resolve(amount / 2)
    })
}

doTask(3) // We use an odd amount
    // We add a `then` handler that will handle success
    .then((result) => {
        console.log('result', result)
    })
    // We add a `then` handler that will handle rejection
    .catch((err) => {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            console.error('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            console.error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.error('cannot be odd')
        } else {
            console.error('Unknown error', err)
        }
    })
