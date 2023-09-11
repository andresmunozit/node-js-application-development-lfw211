// Define a constructor function named "Wolf." By convention, constructor function names start with
// an uppercase letter.
function Wolf(name) {
    this.name = name;
}

// Adding a method "howl" to the Wolf prototype. This means all instances of Wolf will have access
// to this method.
Wolf.prototype.howl = function() {
    console.log(this.name + ": awoooooooo");
};

// Define a constructor function named "Dog" which leverages the Wolf constructor to initialize
// `this.name`.
function Dog(name) {
    // Using `Wolf.call(this, name + ' the dog')` to call the Wolf constructor with the context set
    // to the current Dog instance (`this`), essentially inheriting Wolf's properties and behaviors.
    Wolf.call(this, name + ' the dog');
}

// Utility function to facilitate inheritance by creating a new object with the specified prototype
// object.
function inherit(proto) {
    function ChainLink(){}
    ChainLink.prototype = proto;
    return new ChainLink();
}

// Setting Dog's prototype to a new object which inherits from Wolf's prototype, establishing a
// prototype chain.
Dog.prototype = inherit(Wolf.prototype);

// Adding a method "woof" to the Dog prototype.
Dog.prototype.woof = function() {
    console.log(this.name + ": woof");
};

// Creating a new Dog instance with the name "Rufus."
const rufus = new Dog('Rufus');

// Demonstrating that the `rufus` object can access methods from both the Dog and Wolf prototypes.
rufus.woof(); // prints "Rufus the dog: woof"
rufus.howl(); // prints "Rufus the dog: awoooooooo"

// Validating the prototype chain established through inheritance.
console.log(Object.getPrototypeOf(rufus) === Dog.prototype); // true
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype); // true
