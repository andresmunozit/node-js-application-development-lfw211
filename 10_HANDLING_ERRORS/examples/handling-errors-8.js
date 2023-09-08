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
    const result = doTask(3)
    console.log('result', result)
} catch(err) {
    // Console error only prints an error message in the console, it doesn't deal with the error in
    // any other way
    console.error('Error caugth: ', err)
}
