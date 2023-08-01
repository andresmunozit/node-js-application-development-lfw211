const wolf = {
    howl: function() {console.log(this.name + ': awoooooooo')}
}

const dog = Object.create(wolf, {
    // When using Object.create, each property of the object passed as the second argument, must
    // be an object with the value propert.
    woof: { value: function() {console.log(this.name + ': woof')} }
})

const rufus = Object.create(dog, {
    name: { value: 'Rufus the dog' },
})

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awooooooooo"
