class Wolf {
    constructor(name) {
        this.name = name
    }
    howl() { console.log(this.name + ': awoooooooo') }
}

// `extends` will ensure that the prototype of `Dog.prototype` will be `Wolf.prototype`
class Dog extends Wolf {
    constructor(name) {
        // The `super` keyword is a generic way to call the parent class constructor while setting
        // the `this` keyword to the current instance.
        super(name + 'the dog')
    }

    // Any methods other than constructor are added to the prototype object of the function that the
    // class syntax creates.
    woof() { console.log(this.name + ': woof') }
}

const rufus = new Dog('Rufus')

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"

// This will setup the same prototype chain as in the Functional Prototypal Inheritance and the
// Function Constructors Prototypal Inheritance examples:
console.log(Object.getPrototypeOf(rufus) === Dog.prototype) // true
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype) // true
