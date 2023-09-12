class OddError extends Error {
    // Constructs an OddError instance with a custom message indicating that the input must be even.
    // For example, invoking `new OddError('amount')` will result in an error message: "amount must
    // be even".
    constructor(varName = '') {
        // Calls the parent class (Error) constructor with a custom message.
        super(varName + ' must be even');
    }
    
    // Defines a `name` property for the error type, setting it to "OddError". Utilizing a getter
    // makes the name non-enumerable, optimizing performance since it's accessed only in error
    // instances.
    get name() { return 'OddError'; }
}

function doTask(amount) {
    if (typeof amount !== 'number') throw new TypeError('amount must be a number')
    if (amount <= 0) throw new RangeError('amount must be greater than zero')

    // Now we throw an `OddError` when amount is not even
    if (amount % 2) throw new OddError('amount')
    return amount / 2
}

doTask(3)
