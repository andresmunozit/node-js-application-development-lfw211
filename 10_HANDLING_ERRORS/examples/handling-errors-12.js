class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() { return 'Odd Error [' + this.code + ']' }
}

// Let's create a small utility function for adding a code to an error object
function codify(err, code) {
    err.code = code
    return err
}


// Now let's add a code to the `TypeError` and the `RangeError` objects
function doTask(amount) {
    if (typeof amount !== 'number') throw codify(
        new TypeError('amount must be a number'),
        'ERR_AMOUNT_MUST_BE_NUMBER'
    )
    if (amount <= 0) throw codify(
        new RangeError('amount must be greater than zero'),
        'ERR_AMOUNT_MUST_EXCEED_ZERO'
    )
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

try {
    const result = doTask(4)
    result()
    console.log('result', result)
// Now we can update the catch block to check the code propery instead of using an instance check:
} catch(err) {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
        console.log('wrong type')
    } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
        console.log('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}
