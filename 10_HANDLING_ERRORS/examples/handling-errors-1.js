function doTask(amount) {
    if (typeof amount !== 'number') throw new Error('amount must be a number')
    return amount / 2
}

// Since `doTask` is called with a non-number, the program will crash
doTask('here is some invalid input')
