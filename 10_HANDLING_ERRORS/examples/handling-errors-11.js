class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(4) // Now we use an even input
    
    // The returned value is a number, not a function so the following call will result in an error
    // object which, is an instance of TypeError
    result()
    console.log('result', result)
} catch(err) {
    if (err instanceof TypeError) {
        console.log('wrong type') // So the output will be "wrong"
    } else if (err instanceof RangeError) {
        console.log('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') { // Now we test the `code` instead of the insance
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}
