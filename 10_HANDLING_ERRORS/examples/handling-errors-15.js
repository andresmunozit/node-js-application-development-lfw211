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

doTask(4) // Note that this time we use a valid input
    .then((result) => {
        throw Error('spanner in the works')
    })
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
