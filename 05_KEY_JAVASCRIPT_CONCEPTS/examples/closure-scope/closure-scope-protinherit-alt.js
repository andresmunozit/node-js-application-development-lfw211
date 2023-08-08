function wolf (name) {
    // The state (name) is contained in closure scope and not exposed on the instantiated object,
    // it's encapsulated as private state.
    const howl = () => {
      console.log(name + ': awoooooooo')
    }
    return { howl: howl }
}

function dog (name) {
    name = name + ' the dog'
    const woof = () => { console.log(name + ': woof') }
    return {
        // `...` is called spread operator, which copies the properties from an object into another
        ...wolf(name),
        woof: woof
    }
}

// There is no prototype chain being set up here, the prototype of rufus is `Object.prototype` and
// that's it
const rufus = dog('Rufus')

// `rufus.woof()` is called the woof accesses `name` from it's parent scope, that is, the closure
// scope of dog.
rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"
