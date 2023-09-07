function doTask(amount) {
    if (typeof amount  !== 'number') throw new Error('amount must be a number')

    // THE FOLLOWING IS NOT RECOMMENDED
    if (amount <= 0) throw 'amount must be greater than zero'
    return amount / 2
}

doTask(-1)
