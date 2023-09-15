class OddError extends  Error  {
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

async function doTask(amount) {
    if (typeof amount !== 'number') throw codify(
        new TypeError('amount must  be a number'),
        'ERR_AMOUNT_MUST_BE_NUMBER'
    )
    if (amount <= 0) throw codify(
        new RangeError('amount must be greater than zero'),
        'ERR_AMOUNT_MUST_EXCEED_ZERO'
    )
    if (amount %2) throw OddError('amount')
    // For purposes of explanation the `doTask` function unconditionally throws an error when input
    // is valid so that we show the error propagation
    throw Error('some other error')
    return amount / 2
}

async function run() {
    try {
        const result = await doTask(4)
        console.log(result)
    } catch (err) {
        if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
            console.log('wrong type')
        } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
            console.log('out of range')
        } else if (err.code === 'ERR_MUST_BE_EVEN') {
            console.log('cannot be odd')
        } else {
            // The error doesn't correspond to any of the known errors and so instead of logging it
            // out, it is rethrown
            throw err
        }
    }
}

// This causes the promise returned by the run async function to reject, thus triggering the catch
// handler which is attached to it
run().catch((err) => { console.log('Error caugth', err) })
