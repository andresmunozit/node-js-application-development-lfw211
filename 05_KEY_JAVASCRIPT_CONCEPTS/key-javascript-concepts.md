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

obj2.fn() // prints 2
obj.fn() // prints 999

```

Both `obj` and `obj2` reference the same function but on each invocation the `this` context changes
to the object on which that function was called.

Functions have a `call` method that can be used to set their `this` context:
```js
function fn() {console.log(this.id)}

const obj = {id: 999}
const obj2 = {id: 2}

// In this case the fn function isn't assigned to any of the objects, this was set dynamically via
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

While normal functions have a `prototype` property (which will be discussed in detail shortly), fat
arrow functions do not:
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
    // When using Object.create, each property of the object passed as the second argument, must
    // be an object with the value propert.
    woof: { value: function() {console.log(this.name + ': woof')} }
})

const rufus = Object.create(dog, {
    name: { value: 'Rufus the dog' },
})

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awooooooooo"

```

The `wolf` object is a plain JavaScript object (literal syntax), the prototype of plain JS objects
is `Object.prototype`.

To describe the prototype chain:
- the prototype of `rufus` is `dog`
- the prototype of `dog` is `wolf`
- the prototype of `wolf` is `Object.prototype`

The first argument passed to `Object.create` is the desired prototype. The second argument is an
optional **Property Descriptor** object `{property1: {value: 1}, property2: {value: 2}}...`.

The `Object.getOwnPropertyDescriptor` can be used to get a property descriptor of an object:
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
