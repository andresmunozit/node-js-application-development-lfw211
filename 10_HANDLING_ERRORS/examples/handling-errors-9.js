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
    // When the input is invalid, `doTask` function will throw so program execution doesn't proceed
    // to the next line but instead jumps to the `catch` block
    const result = doTask(4) // valid input
    console.log('result', result)
} catch(err) {
    console.error('Error caugth: ', err)
}
