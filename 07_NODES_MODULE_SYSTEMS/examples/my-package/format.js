'use strict'

// `upper` function will convert any input to a string and then tthat string to an upper-cased
// string
const upper = (str) => {
    if (typeof str === 'symbol') str = str.toString()
    str += ''
    return str.toUpperCase()
}

// Whatever is assigned to `module.exports` will be the value returned when the module is required
module.exports =  { upper: upper }
