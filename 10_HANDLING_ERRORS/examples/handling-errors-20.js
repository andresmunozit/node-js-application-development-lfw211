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

function doTask(amount, cb) {
    // Validate input and handle errors using callback
    if (typeof amount !== 'number') {
        cb(codify(
            new TypeError('amount must be a number'),
            'ERR_AMOUNT_MUST_BE_NUMBER'
        ))
        return
    }
    if(amount <= 0) {
        cb(codify(
            new RangeError('amount must be greater than zero'),
            'ERR_AMOUNT_MUST_EXCEED_ZERO'
        ))
        return
    }
    if(amount % 2) {
        cb(codify(
            new OddError('amount')
        ))
        return
    }
    cb(null, amount / 2)
}

// The `run` function has to be adapted to take a callback, so errors can propagate via that
// callback function
function run(cb) {
    // When calling `doTask` we need to now supply a callback function and check whether the first
    // `err` arguument is truthy to generate the equivalent of a catch block
    doTask(4, (err, result) => { // Valid input
        if (err) {
            if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
                cb(Error('wrong type'))
            } else if (err.code === 'ERR_AMOUNT_MUST_EXCEED_ZERO') {
                cb(Error('out of range'))
            } else if (err.code === 'ERR_MUST_BE_EVEN') {
                cb(Error('cannot be odd'))
            } else {
                cb(err)
            }
            return
        }
        console.log('result', result)
    })
}

// We call run and pass it a callback function, which checks whether the first argument (err) is
// truthy and if it is, the error is logged
run((err) => {
    if (err) console.error('Error caught', err)
})
