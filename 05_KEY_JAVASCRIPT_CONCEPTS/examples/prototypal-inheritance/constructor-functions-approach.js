// This is a constructor function.
// It is a convention to use PascalCase for functions that are intended to be called with `new`
function Wolf(name) {
    this.name = name
}

// Every function always has a preexisting `prototype` object
// In this case we're overwriting the previous `Wolf.prototype`
Wolf.prototype.howl = function() {
    console.log(this.name + ": awoooooooo")
}
function Dog(name) {
    // The `call` function sets `this` dynamically
    // Using the `call` method on a function allows the `this` object of the function being called
    // to be set via the first argument passed to call
    // All subsequent arguments passed to call become the function arguments, so the name argument
    // passed to Wolf is "Rufus the dog", when we instantiate `rufus` later
    // `Wolf.call` sets `this.name`, to the second argument `name` plus a string 
    Wolf.call(this, name + ' the dog')
}

// `inherit` utility funnction uses an empty constructor function to create a new object with a
// prototype pointing, in this case, to `Wolf.prototype`.
function inherit(proto) {
    function ChainLink(){}
    ChainLink.prototype = proto
    return new ChainLink()
}

// `Dog.prototype` is explicitly assigned, overwriting the previous `Dog.prototype` objec
Dog.prototype = inherit(Wolf.prototype)

Dog.prototype.woof = function() {
    console.log(this.name + ": woof")
}

// The new `rufus` object is created
// The new object is also the `this` object within the Dog constructor function
// The new object is also referenced via the `this` object inside the Wolf constructor
// function
// The `Wolf` constructor sets this.name to "Rufus the dog", which means that ultimately
// `rufus.name` is set to "Rufus the dog"
const rufus = new Dog('Rufus')

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"

// This will setup the same prototype chain as in the functional Prototypal inheritance example:
console.log(Object.getPrototypeOf(rufus) === Dog.prototype)
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype)
