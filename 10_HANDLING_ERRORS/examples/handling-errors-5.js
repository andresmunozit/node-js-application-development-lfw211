function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be a number')

    // Let's add a new validation requirement such that `amount` may only contain even numbers
    if (amount % 2) {
        // If amount is not even we'll create an error and add a `code` property
        const err = Error('amount must be even')
        err.code = 'ERR_MUST_BE_EVEN'
        throw err
    }
    return amount / 2
}

doTask(3)
