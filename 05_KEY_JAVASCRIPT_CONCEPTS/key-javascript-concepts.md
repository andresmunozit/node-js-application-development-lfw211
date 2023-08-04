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
Creating a function with a specific prototype object can also be achieved by  calling a function
with the `new` keyword. This is a common pattern in legacy code so it's worth understanding.

All functions have a `prototype` property.
```js
// 05_KEY_JAVASCRIPT_CONCEPTS/examples/prototypal-inheritance/constructor-functions-approach.js
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

```

There was no standard or native approach to this before **EcmaScript 5**, so legacy code bases may
implements inheritance in multiple ways.

#### EcmaScript 5+
In JS runtimes that support **EcmaScript 5+**, `Object.create` function can be used to the same
effect

```js
function Dog(name) {
  Wolf.call(this, name + ' the dog')
}

Dog.prototype = Object.create(dog, {
  name: {value: "Rufus"}
})

Dog.prototype.woof = function() {
  console.log(this.name + ": woof")
}

```

Node.js has a utility function: `util.inherits` that is often used in code bases using constructor
functions:
```js
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

In contemporary Node.js, util.inherits uses the EcmaScript 2015 (ES6) method `Object.setPrototypeOf`
under the hood. It's essentially executing the following:
```js
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

// `Object.setPrototypeOfObject.setPrototypeOf(o, proto)` Sets the prototype of a specified object o
// to object proto or null. Returns the object o.
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
class Wolf {
  constructor(name) {
    this.name = name
  }
  howl() { console.log(this.name + ': awooooo') }
}

class Dog {
  constructor(name) {
    super(name + 'the dog')
  }
  woof() { console.log(this.name + ': woof') }
}

rufus = new Dog('Rufus')

rufus.woof()
rufus.howl()

console.log(Object.getPrototypeOf(rufus) === Dog.prototype)
console.log(Object.getprototypeOf(Dog.prototype) === Wolf.prototype)


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
Parameters and variables created in the function are stored on this invisible object.
