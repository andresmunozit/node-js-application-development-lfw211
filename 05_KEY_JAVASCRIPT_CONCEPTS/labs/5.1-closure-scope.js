// Excercise: Implement the prefixer function
'use strict'

// Solution
function prefixer(prefix) {
    return function(name) { 
        return prefix + name
    }
}
//

const sayHiTo = prefixer('Hello ')
const sayByeTo = prefixer('Goodbye ')
console.log(sayHiTo('Dave')) // prints 'Hello Dave'
console.log(sayHiTo('Annie')) // prints 'Hello Annie'
console.log(sayByeTo('Dave')) // prints 'Goodbye Dave'
