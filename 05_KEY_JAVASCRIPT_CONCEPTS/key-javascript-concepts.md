# KEY JAVASCRIPT CONCEPTS
This section focuses on understanding key fundamentals of the language.

## Data Types
JavaScript is a loosely typed dynamic languaje. In JavaScript there are seven primimtive types.
Everything else, including functions and arrays, is an object.

- Null: null
- Udefined: undefined
- Number: 1, 1.5, -1e4, NaN
- BigInt: 1n, 90071199254740993n
- String: 'str', "str", `str ${var}`
- Boolean: true, false
- Symbol: Symbol('description'), Symbol.for('namespace')

The **null** primitive is typically used to describe the absence of an object, whereas **undefined**
is the absence of a defined value. Any variable initialized without a value will be **undefined**.
Any expression that attempts access of a non-existent property on an object will result in
**undefined**. A function without a return statement will return **undefined**.

The **Number** type is double-precision floating-point format. It allows both integers and decimals
but has an integer range of `-2^53 - 1` to `2^53 - 1`. The **BigInt** type has no upper/lower limit
on integers.

**Strings** can be created with single or double quotes, or backticks. Strings created with
backticks are template strings, these can be multiline and support interpolation whereas normal
strings can only be concatenated together using the plus (+) operator.

**Symbols** can be used as unique identifier keys in objects. The `Symbol.for` method creates/gets a
global symbol.

Other than that, absolutely everything else in JavaScript is an **object**. An **object** is a set
of key value pairs, where values can be any primitive type or an object. Object keys are called
properties. An object with a key holding a value that is another object allows for nested data
structures.

```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/objects/app.js
const obj = {myKey: {thisIs: 'a nested object'}}
console.log(obj.myKey)

```

```sh
$ node app.js
{ thisIs: 'a nested object' }

```

All JavaScript objects have *prototypes*. A *prototype* is an implicit reference to another object
that is queried on object properties. If the object's prototype does not have that property, the
object's prototype's prototype is checked and so on.

This is how inheritance in JavaScript works, JavaScript is a prototypal language.


## Functions
Functions are first class citizens in JavaScript. A function is an object, and therefore a value
that can be used like any other value.

For instance a function can be returned from a function:
```js
function factory() {
    return function doSomething() {}
}

```

A function can be passed to another function as an argument:
```js
setTimeout(function() { console.log('hello from the future')}, 100)

```

A function can be assigned to an object:
```js
// When a function is assigned to an object, the implicit this keyword will refer to the object on
// which the function was called.
const obj = {id: 999, fn: function() {console.log(this.id)}}
obj.fn() // prints 999

```

It's crucial to understand that `this` refers to the object on which the function was called, not
the object wich the function was assined to:
```js
const obj = {id: 999, fn: function() {console.log(this.id)}}
const obj2 = {id: 2, fn: obj.fn}

obj.fn() // prints 999
obj2.fn() // prints 2

```

Functions have a `call` method that can be used to set their `this` context:
```js
function fn() {console.log(this.id)}

const obj = {id: 999}
const obj2 = {id: 2}

// In this case the fn function isn't assigned to any of the objects, `this` was set dynamically via
// the call function.
fn.call(obj2) // prints 2
fn.call(obj) // prints 999
fn.call({id: ':)'}) // prints :)

```

### Lambda / Arrow Functions
There are also fat arrow functions, also known as lambda functions.
```js
// When defined without curly braces, the expression following the arrow, is the return value of
// the function
const add = (a, b) => a + b

const cube = (n) => {
    return Math.pow(n, 3)
}

```

Lambda functions lack of its own context, when `this` is referenced inside of the function, it will
refers to the `this` context of the nearest parent **non-lambda function**.
```js
function fn() {
    return (offset) => {
        console.log(this.id + offset)
    }
}

const obj = {id: 999}

const offsetter = fn.call(obj)

offsetter(1) // prints 1000 (999 + 1)

```

While normal functions have a `prototype` property (discussed bellow), fat arrow functions do not:
```js
function normalFunction() {}
const fatArrowFunction = () => {}

console.log(typeof normalFunction.prototype) // prints 'object'
console.log(typeof fatArrowFunction.prototype) // prints 'undefined'

```

## Prototypal Inheritance (Functional)
At a fundamental level, inheritance in JavaScript is achieved with a chain of prototypes. This
approach has evolved, as updates to the languaje have integrated new features and syntax.

We will explore three common approaches to creating a prototype chain:
- functional
- constructor functions
- class-syntax constructors

For the purposes of these examples, we will be using a Wolf and Dog taxonomy, where a Wolf is a
prototype of a Dog.

### Functional Approach
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/functional-approach.js
const wolf = {
    howl: function() {console.log(this.name + ': awoooooooo')}
}

const dog = Object.create(wolf, {
    // The first argument passed to `Object.create` is the desired prototype. The second argument is
    // an optional Property Descriptor object `{property1: {value: 1}, property2: {value: 2}}...`.
    woof: { value: function() {console.log(this.name + ': woof')} }
})

const rufus = Object.create(dog, {
    name: { value: 'Rufus the dog' },
})

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awooooooooo"

```

To describe the prototype chain:
- the prototype of `rufus` is `dog`
- the prototype of `dog` is `wolf`
- the prototype of `wolf` is `Object.prototype`. The `wolf` object is a plain JavaScript object
(literal syntax), the prototype of plain JS objects is `Object.prototype`.

The `Object.getOwnPropertyDescriptor` can be used to get a **property descriptor** of an object, by
specifying the object and the property name:
```sh
$ node -p "Object.getOwnPropertyDescriptor(process, 'title')"
{ value: 'node', writable: true, enumerable: true, configurable: true }

$ node -p "Object.getOwnPropertyDescriptor(global, 'process')"
{
  get: [Function: get],
  set: [Function: set],
  enumerable: false,
  configurable: true
}

```

To describe the value of a property, the descriptor can either use `value` for a normal value or
`get` and `set` to create a property getter/setter. The other properties are associated meta-data
for the property are:
- `writable` determines whether the property can be reassigned
- `enumerable` determines whether the property will be enumerated in property iterator
abstractions like `Object.keys`
- `configurable` sets wheter the property descriptor itself can be altered

All of these meta-data keys default to false.

In the case of the previous code examples, because `dog` and `rufus` property descriptor only sets
`value`, the `writable`, `enumerable` and `configurable` properties are by default set to false.

Property descriptors are not directly relevant to prototypal inheritance, but are part of the
`Object.create` interface.

> `Object.defineProperty()` in JavaScript allows for the precise control of an object's property.
Unlike normal property addition, it permits customization of whether the property can be changed,
enumerated, or deleted. By default, properties added this way are not writable, enumerable, or
configurable, and the method doesn't invoke setters, even if the property already exists, due to its
use of the [[DefineOwnProperty]] internal method instead of [[Set]].

See examples at
[mdn web docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#examples).

#### Prototype Inheritance Chain
Let's copy the code here again to analyze the prototype inheritance chain:
```js
const wolf = {
    howl: function() {console.log(this.name + ': awoooooooo')}
}

const dog = Object.create(wolf, {
    woof: { value: function() {console.log(this.name + ': woof')} }
})

const rufus = Object.create(dog, {
    name: { value: 'Rufus the dog' },
})

rufus.woof()
rufus.howl()

```

To describe the prototype chain:
- the prototype of `rufus` is `dog`
- the prototype of `dog` is `wolf`
- the prototype of `wolf` is `Object.prototype`

When `rufus.woof()` is called the JavaScript runtime performs the following steps:
- Check if `rufus` has a `woof` property; it does not
- Check if the prototype of `rufus` has a `woof` property; it does have a `woof` property, since it
is `dog`
- Execute the `woof` function setting `this` to `rufus`, so `this.name` will be "Rufus the dog"

#### Instance Creation
To complete the functional paradigm, the creation of an instance of a `dog` can be generalized with
a function:
```js
const wolf = {
  howl: function () { console.log(this.name + ': awoooooooo') }
}

const dog = Object.create(wolf, {
  woof: { value: function() { console.log(this.name + ': woof') } }
})

function createDog (name) {
  return Object.create(dog, {
    name: {value: name + ' the dog'}
  })
}

const rufus = createDog('Rufus')

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"

// The prototype of an object can be inspected with Object.getPrototypeOf:
console.log(Object.getPrototypeOf(rufus) === dog) // true
console.log(Object.getPrototypeOf(dog) === wolf) // true

```

### Prototypal Inheritance (Constructor Functions)
Creating a function with a specific prototype object can also be achieved by calling a function
with the `new` keyword. This is a common pattern in legacy code so it's worth understanding.

All functions have a `prototype` property.
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/constructor-functions-approach.js
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

```

There was no standard or native approach to this before **EcmaScript 5**, so legacy code bases may
implement inheritance in multiple ways.

#### EcmaScript 5+
In JS runtimes that support **EcmaScript 5+**, `Object.create` function can be used to the same
effect

```js
// Define a constructor function named "Wolf" to create a Wolf object with a specified name.
function Wolf(name) {
  this.name = name;
}

// Define a constructor function named "Dog" which calls the Wolf constructor, 
// augmenting the name parameter with the string ' the dog' before passing it.
function Dog(name) {
  Wolf.call(this, name + ' the dog');
}

// Set up prototypal inheritance: we create a new object which is a prototype of Wolf, 
// and assign it to be the prototype of Dog, ensuring Dog instances will have access 
// to properties and methods defined on Wolf.prototype.
Dog.prototype = Object.create(Wolf.prototype);

// Add a method "woof" to Dog's prototype which logs a message including the Dog 
// instance's name.
Dog.prototype.woof = function() {
  console.log(this.name + ": woof");
};


```

Node.js has a utility function: `util.inherits` that is often used in code bases using constructor
functions:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/constructor-functions-util-inherits.js
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
 
```

In the modern version of Node.js, util.inherits is powered by the ES6 (2015 version of JavaScript)
method called `Object.setPrototypeOf`. It's essentially executing the following:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/constructor-functions-set-prototype-of.js
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

// `Object.setPrototypeOfObject.setPrototypeOf(o, proto)` Sets the `prototype` of a specified object
// `o` to object `proto` or null. Returns the object o.
Object.setPrototypeOf(Dog.prototype, Wolf.prototype)

const rufus = new Dog('Rufus')

rufus.woof() // Rufus the dog: woof
rufus.howl() // Rufus the dog: awooooo

console.log(Object.getPrototypeOf(rufus) === Dog.prototype) // true
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype) // true

```

### Prototypal Inheritance (Class-Syntax Constructors)
Modern JS (EcmaSript 2015+), has a `class` keyword; this is not the `class` keyword in other OOP
languages. The `class` keyword is syntactic sugar for the same Constuctor Function discussed in the
previous section.
```sh
$ node -p "class Foo{}; typeof Foo"  
function

```

Class syntax creates prototype chains to provide Prototypal inheritance opposed to Classical
inheritance. It also reduces boilerplate when creating a prototype chain.
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/class-syntax-constructors.js
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

```

In the Constructor Function example `Wolf.call(this, name + ' the dog')` is equivalent to
`super(name + ' the dog')` in Dog's constructor method.

The class syntax definition of `Wolf`, is desugared to:
```js
/* class Wolf {
  constructor(name) {
    this.name = name
  }
  howl() { console.log(this.name + ': awooooo') }
} */

function Wolf(name) {
  this.name = name
}

Wolf.prototype.howl = function() { console.log(this.name + ': awoooooooo') }

```

## Closure Scope
When a function is created, an invisible object is created, this is known as the closure scope.
**Parameters** and **variables** created in the function are stored on this invisible object.

When a function is inside another function, it can access both its own closure scope, and the parent
closure scope:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/closure-scope/closure-scope.js
function outerFn() {
    var foo = true
    function print() { console.log(foo) }
    print() // prints true
    foo = false

    // The outer variable is accessed when the inner function is invoked, this is why the second
    // `print` call outputs `false` after foo is updated to `false`
    print() // prints false
}

outerFn()

```

If there is a naming collision then the reference to the nearest closure scope takes preference:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/closure-scope/closure-scope-collision.js
function outerFn () {
    var foo = true
    function print(foo) { console.log(foo) }

    // In this case the foo parameter of `print` takes preference over the foo variable in the
    // `outerFn` function.
    print(1) // prints 1
    foo = false
    print(2) // prints 2
}

outerFn()

```

Closure scope cannot be accessed outside of a function:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/closure-scope/closure-scope-outside.js
function outerFn() {
    var foo = true
}

outerFn()
console.log(foo) // Will trow a `ReferenceError: foo is not defined`

```

Functions returning functions encapsulate private state through closure scope:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/closure-scope/closure-scope-encapsulation-secret.js
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
// The following two functions have access to two separate instances of the `init` functions closure
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
// `createBook` function is a different instance of the function returned from `init` and therefore
// accesses a separate instance of the `init` function's scope
const ncb = createBook('Node Cookbook')

console.log(dave) //prints {id: 1, type: 'user', name: 'Dave'}
console.log(annie) //prints {id: 2, type: 'user', name: 'Annie'}
console.log(ncb) //prints {id: 1, type: 'book', name: 'Node Cookbook'}

```

Another example of encapsulating state using closure scope would be to enclose a secret:
```js
// Note, in this code `createKeypair` and `cryptoSign` are imaginary functions, these are purely for
// outlining the concept of the encapsulation of secrets.
function createSigner(secret) {
    const keypair = createKeypair(secret)
    return function(content) {
        return {
            signed: cryptoSign(content, keypair.privateKey),
            publicKey: keypair.publicKey
        }
    }
}

const sign = createSigner('super secret thing')
const signedContent = sign('sign me')
const moreSignedContent = sign('sign me as well')

```

Closure scope can also be used as an alternative to prototypal inheritance:
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/closure-scope/closure-scope-protinherit-alt.js
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

```

Using closure scope for object composition avoids issues with prototypes, `this` context,
and unintended effects of omitting `new`. While it might create more internal functions per instance
compared to shared prototype methods, modern JavaScript engines optimize well. Prioritize ergonomics
and maintainability; use function composition over prototypal inheritance and optimize later if
needed.

## Labs
See the labs at `./249ymzn0nkk5-LFW211Labs06.28.2023.pdf`:

### Lab 5.1 - Closure Scope
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/labs/5.1-closure-scope.js
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

```

### sLab 5.2 - Prototypal Inheritance
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/labs/5.2-prototypal-inheritance.js
const assert = require('assert')
// TODO:
// implement a way to create a prototype chain
// of leopard -> lynx -> cat
// leopard prototype must have ONLY a hiss method
// lynx prototype must have ONLY a purr method
// cat prototype must have ONLY a meow method

// Solution
class Leopard {
    constructor(name) {
        this.name = name 
    }
    hiss() {
        console.log(this.name + ': hsss')
    }
}

class Lynx extends Leopard {
    constructor(name) {
        super(name)
    }
    purr() {
        console.log(this.name + ': prrr')
    }
}

class Cat extends Lynx {
    constructor(name) {
        super(name + ' the cat')
    }
    meow() {
        console.log(this.name + ': meow')
    }
}
// 

// const felix = null //TODO replace null with instantiation of a cat
const felix = new Cat('Felix')

felix.meow() // prints Felix the cat: meow
felix.purr() // prints Felix the cat: prrr
felix.hiss() // prints Felix the cat: hsss

// prototype checks, do not remove
const felixProto = Object.getPrototypeOf(felix)
const felixProtoProto = Object.getPrototypeOf(felixProto)
const felixProtoProtoProto = Object.getPrototypeOf(felixProtoProto)
assert(Object.getOwnPropertyNames(felixProto).length, 1)
assert(Object.getOwnPropertyNames(felixProtoProto).length, 1)
assert(Object.getOwnPropertyNames(felixProtoProto).length, 1)
assert(typeof felixProto.meow, 'function')
assert(typeof felixProtoProto.purr, 'function')
assert(typeof felixProtoProtoProto.hiss, 'function')

console.log('prototype checks passed!')

```

## Knowledge Check
1. When a function is on an object which is the prototype of another object (the "instance"), and
the function is called on the instance object what does `this` (usually) refer to?
- A. The prototype object
- B. The instance object [x]
- C. The global object

2. What does the `extend` keyword do?
- A. Inherits from an abstract class
- B. Copies properties from one object to another
- C. Sets up part of a prototype chain [x]

3. From where can closure scope be accessed?
- A. Inside a function and any functions within that function [x]
- B. From the outside of a function
- C. Anywhere
