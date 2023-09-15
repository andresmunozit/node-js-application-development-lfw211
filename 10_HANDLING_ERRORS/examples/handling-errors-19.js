class OddError extends Error {
    constructor(varName = '') {
        super(varName + ' must be even')
        this.code = 'ERR_MUST_BE_EVEN'
    }
    get name() {
        return 'OddError [' + this.code + ']'
    }
}

function codify(err, code) {
    err.code = code
    return err
}

// We remove the async keyword from `doTask` and `run` functions
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
    throw Error('some other error')
    return amount / 2
}

function run() {
    try {
        // We remove the `await` keyword since run and `doTask` are not `async`  functions anymore
        const result = doTask('not a valid input') // This will cause a `TypeError` to be thrown
        console.log('result', result)
    } catch (err) {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            throw Error('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            throw Error('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            throw Error('cannot be odd')
        } else {
            throw err
        }
    }
}

// Since `run` is synchronous it will return a value instead of a promise, that means we can't use
// the `catch` handler, instead we're using a try/catch block outside of `run`
try { run() } catch (err) { console.error('Error caught', err) }
