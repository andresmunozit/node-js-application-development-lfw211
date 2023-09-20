const buffer = Buffer.from('👀')
console.log(buffer) // prints <Buffer f0 9f 91 80>
console.log(buffer.toString()) // prints 👀
// Concatenating a buffer to an empty string has the same effect to call the `toString` method
console.log(buffer + '') // prints 👀