// `init` function sets an `id` in its scope and takes an argument called `type`, then  returns a
// function
function init(type){
    var id = 0
    // Closure scope rules apply in exactly the same way to fat arrow functions
    return (name) => {
        id +=1
        return { id: id, type: type, name: name }
    }
}

// The returned function has access to `type` and `id` because it has access to the parent closure
// scope
// The following two functions have access to two separate instances of the init functions closure
// scope
const createUser = init('user')
const createBook = init('book')

// The first call to `createUser` returns an object with an id `id` 1. The initial value is set to
// 0 at the returned function's outer scope, and then it's set to 1 before returning the object.
const dave = createUser('Dave')

// The second call to `createUser` returns an object with id of 2. This is because the first call of
// `createUser` already incremented id from 0 to 1
const annie = createUser('Annie')

// The only call to the `createBook` function however, returns an id of 1 (as opposed to 3), because
// `createBook` function is a different instance of the function returned from init and therefore
// accesses a separate instance of the init function's scope
const ncb = createBook('Node Cookbook')

console.log(dave) //prints {id: 1, type: 'user', name: 'Dave'}
console.log(annie) //prints {id: 2, type: 'user', name: 'Annie'}
console.log(ncb) //prints {id: 1, type: 'book', name: 'Node Cookbook'}
