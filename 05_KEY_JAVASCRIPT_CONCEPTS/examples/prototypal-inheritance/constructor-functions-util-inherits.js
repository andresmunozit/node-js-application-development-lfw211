const util = require('util')

function Wolf(name) {
  this.name = name
}

Wolf.prototype.howl = function() {
  console.log(this.name + ': awoooooooo')
}

function Dog (name) {
  Wolf.call(this, name + ' the dog')
}

Dog.prototype.woof = function () {
  console.log(this.name + ': woof')
}

// `util.inherits(constructor, superConstructor)` Inherit the prototype methods from one constructor
// into another
util.inherits(Dog, Wolf)

const rufus = new Dog('Rufus')

rufus.woof() // Rufus the dog: woof
rufus.howl() // Rufus the dog: awooooo

console.log(Object.getPrototypeOf(rufus) === Dog.prototype) // true
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype) // true
