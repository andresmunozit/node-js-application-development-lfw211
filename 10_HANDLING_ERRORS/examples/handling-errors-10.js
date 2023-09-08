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
    const result = doTask(3) // 1st execution
    // const result = doTask('here is some invalid input') // 2st execution
    // const result = doTask(-1) // 3rd execution
    
    console.log('result', result)
} catch(err) {
    if (err instanceof TypeError) {
        console.log('wrong type')
    } else if (err instanceof RangeError) {
        console.log('out of range')
    } else if (err instanceof OddError) {
        console.log('cannot be odd')
    } else {
        console.error('Unknown error', err)
    }
}
