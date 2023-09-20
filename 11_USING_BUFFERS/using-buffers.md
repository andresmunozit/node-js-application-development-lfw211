# Using Buffers
In server-side programming with Node.js, managing binary data is vital. This is done using the
`Buffer` constructor. When you don't set a specific encoding while reading from sources like the
file system or network socket in Node.js, you will receive data in the form of array-like structures
created by the `Buffer` constructor. We'll learn how to use it to handle binary data in this chapter.

## The Buffer Instance
The `Buffer` constructor is built into Node.js. You don't need to import any modules to use the core
`Buffer` API:
```txt
$ node -p "Buffer"
[Function: Buffer] {
  poolSize: 8192,
  from: [Function: from],
  of: [Function: of],
  alloc: [Function: alloc],
  allocUnsafe: [Function: allocUnsafe],
  allocUnsafeSlow: [Function: allocUnsafeSlow],
  isBuffer: [Function: isBuffer],
  compare: [Function: compare],
  isEncoding: [Function: isEncoding],
  concat: [Function: concat],
  byteLength: [Function: byteLength],
  [Symbol(kIsEncodingSymbol)]: [Function: isEncoding]
}

```

When the `Buffer` constructor was first introduced into Node.js the JavaScript language did not have
a native binary type.

Later, JavaScript added tools for working with binary data — `ArrayBuffer` and Typed Arrays, for
instance:
- `ArrayBuffer:` A container for binary data.
- `Float64Array:` Reads data in 8-byte chunks as 64-bit numbers.
- `Int32Array:` Interprets data in 4-byte chunks as 32-bit signed integers.
- `Uint8Array:` Treats each byte as a number between 0-255.

When those new data structures were added to JavaScript, the `Buffer` constructor internals were
refactored on top of the `Uint8Array` typed array. So a buffer object is both an instance of
`Buffer` and an instance (at the second degree) of `Uint8Array`:
```txt
$ node
Welcome to Node.js v18.15.0.
> const buffer = Buffer.alloc(10)
undefined
> buffer instanceof Buffer
true
> buffer instanceof Uint8Array
true
> 

```

This means there are additional API's that can be used besides of the `Buffer` own methods. 

Note that the `Buffer.prototype.slice` method overrides the `Uint8Array.prototype.slice` method:
  - `Uint8Array.prototype.slice` will take a *copy* of buffer between two index points.
  - `Buffer.prototype.slice` will return a `Buffer` instance that *references* the binary data of 
  the original buffer that `slice` was called on:
```txt
$ node
Welcome to Node.js v18.15.0.
Type ".help" for more information.
> var buf1, buf2, buf3, buf4
undefined
> buf1 = Buffer.alloc(10)
<Buffer 00 00 00 00 00 00 00 00 00 00>
> buf2 = buf1.slice(2, 3)
<Buffer 00>
> buf2[0] = 100 
100
> buf2
<Buffer 64>
> buf1
<Buffer 00 00 64 00 00 00 00 00 00 00>
> buf3 = new Uint8Array(10)
Uint8Array(10) [
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0
]
> buf4 = buf3.slice(2, 3)
Uint8Array(1) [ 0 ]
> buf4[0] = 100
100
> buf4
Uint8Array(1) [ 100 ]
> buf3
Uint8Array(10) [
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0
]

```

As we saw, `buf2` is a reference to `buf1[2]` but `buf4` is a copy of `buf3[2]` which references a
completely separate memory.

## Allocating Buffers
Using `new Buffer` is deprecated, the correct way to allocate a buffer of a certain amount of bytes
is to use `Buffer.alloc`.

The following example would allocate a *zero-filled* buffer of 10 bytes:
```txt
$ node -p 'Buffer.alloc(10)'
<Buffer 00 00 00 00 00 00 00 00 00 00>

```

When a buffer is printed to the terminal it will be represented like
**\<Buffer [list of bytes represented in hexadecimal]\>**.

Using `Buffer.alloc` is the safe way to create buffers. There is an unsafe way:
```js
const buffer = Buffer.allocUnsafe(10)

```

`Buffer.allocUnsafe` it’s a riskier method because it:
  - Pulls from memory not yet wiped, possibly holding old, deleted data
  - Returns different garbage bytes every time
```txt
$ node -p "Buffer.allocUnsafe(10)"
<Buffer 00 00 00 00 00 00 00 00 00 00>

```

While faster, it should be used judiciously with a focus on security.

`new Buffer` is deprecated due to its changed behavior from risky `Buffer.allocUnsafe` to safe
`Buffer.alloc`, and its inconsistent outcomes on different Node versions; additionally, it accepts
strings.

The key take-away from this section is: if we need to safely create a buffer, use `Buffer.alloc`.

## Converting Strings to Buffers
A buffer can be created from a string by using `Buffer.from`:
```js
// Example
const buffer = Buffer.from('hello world')

```

The characters in the string passed to `Buffer.from` are converted to byte values:
```txt
$ node -p "Buffer.from('hello world')"
<Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>

```

To turn a string into binary, an encoding must be assumed. `Buffer.from` defaults to UTF8 encoding
when converting strings to binary. Since UTF8 can use up to four bytes per character, the string
length might not match the buffer size:
```txt
$ node -e "console.log('👀'.length)" 
2

$ node -e "console.log(Buffer.from('👀').length)"
4

```

Even though there is one character in the string, it has a length of 2. This is to do with how
Unicode symbols work, more on that bellow.

When the string is converted to a buffer however, it has a length of 4. This is because in UTF8
encoding, the eyes emoji is represented with four bytes:
```txt
$ node -p "'👀'.length"
2

$ node -p "Buffer.from('👀').length"
4

$ node -p "Buffer.from('👀')"       
<Buffer f0 9f 91 80>

```

In UTF-8, characters use 1 to 4 bytes. The initial bits of a byte determine if it's the start of a
new character or a continuation:
  - 1-byte (ASCII): starts with 0
  - 2-byte: starts with 110
  - 3-byte: starts with 1110
  - 4-byte: starts with 11110

Continuation bytes start with 10. When reconstructing a string, Node.js reads the initial bits to
determine the byte-length of each character, ensuring correct string representation.

For instance, in the string "h👀" represented as the \<Buffer 68 f0 9f 91 80\>, "h" is
single-byte (`68`) while "👀" spans 4 bytes (`f0 9f 91 80`). The `toString` method identifies the
start and length of each character ensuring accurate representation during conversion.

When the first argument of `Buffer.from` is a string, we can provide a second argument to set the
encoding. There are two types of encodings in this context, *character encodings* and
*binary-to-text encodings*

UTF8 and UTF16LE are of type character encoding. When we use different encoding it results in a
buffer with different byte values and/or different buffer sizes:
```txt
$ node -p "Buffer.from('👀')"  
<Buffer f0 9f 91 80>

$ node -p "Buffer.from('👀', 'utf16le')"
<Buffer 3d d8 40 dc>

$ node -p "Buffer.from('A')"            
<Buffer 41>

$ node -p "Buffer.from('A', 'utf16le')"
<Buffer 41 00>

```

In the following Node.js example, we are illustrating how to create identical Buffer objects from
two different inputs representing the same data but encoded differently; one being a UTF-8 encoded
string ("👀") and the other its base64 representation ("8J+RgA=="):
```txt
$ node      
Welcome to Node.js v18.15.0.
Type ".help" for more information.
> var str = '👀'
undefined
> var buf = Buffer.from(str)
undefined
> buf
<Buffer f0 9f 91 80>
> buf.toString('base64')
'8J+RgA=='
> var buf2 = Buffer.from('8J+RgA==', 'base64')
undefined
> buf2
<Buffer f0 9f 91 80>
> buf2.equals(buf)
true

```

## Converting Buffers to Strings
To convert a buffer to string, call the `toString` method on a `Buffer` instance:
```js
// 11_USING_BUFFERS/examples/buffers-1.js
const buffer = Buffer.from('👀')
console.log(buffer) // prints <Buffer f0 9f 91 80>
console.log(buffer.toString()) // prints 👀
// Concatenating a buffer to an empty string has the same effect to call the `toString` method
console.log(buffer + '') // prints 👀

```
```txt
$ node buffers-1.js
<Buffer f0 9f 91 80>
👀
👀

```

The `toString` method can be passed an encoding as a an argument:
```js
// 11_USING_BUFFERS/examples/buffers-2.js
const buffer = Buffer.from('👀')
console.log(buffer) // prints <Buffer f0 9f 91 80>
console.log(buffer.toString('hex')) // prints f09f9180
console.log(buffer.toString('base64'))  // prints 8J+RgA==

```
```txt
$ node buffers-2.js
<Buffer f0 9f 91 80>
f09f9180
8J+RgA==

```

UTF8 is a system used to store characters, with each character taking up between 1 to 4 bytes. If
any of those bytes are missing or separated, it causes errors. To prevent this when working with
multiple groups of bytes in Node.js, it is recommended to use something called the `string_decoder`
module which ensures that characters are not broken and remain readable:
```js
// 11_USING_BUFFERS/examples/buffers-3.js
const { StringDecoder } = require('string_decoder')
const frag1 = Buffer.from('f09f', 'hex')
const frag2 = Buffer.from('9180', 'hex')
console.log(frag1.toString()) // prints �
console.log(frag2.toString()) // prints ��
const decoder = new StringDecoder()
// The `decoder.write` function only displays a character once it has received all the necessary
// bytes for that character
console.log(decoder.write(frag1)) // Prints nothing because frag1 ("f09f") doesn't form a character
console.log(decoder.write(frag2)) // Prints 👀, the frag2 ("9180") contains the rest of the
                                  // character, so the four bytes ("f09f9180") conform now the eyes
                                  // emoji

```
```txt
$ node buffers-3.js 
�
��

👀

```

## JSON Serializing and Deserializing Buffers
JSON is a very common serialization format. `JSON.stringify` method automatically calls an object's
`toJSON` method if it is available. `Buffer` instances have a `toJSON` method which returns a plane
JavaScript object, in order to present the buffer in a JSON-friendly way:
```txt
$ node -p "Buffer.from('👀').toJSON()"
{ type: 'Buffer', data: [ 240, 159, 145, 128 ] }

$ node -p "JSON.stringify(Buffer.from('👀'))"
{"type":"Buffer","data":[240,159,145,128]}

```

So `Buffer` instances are represented in JSON by an object that has a `type` property with a string
value of "Buffer" and a `data` property with an array of numbers, representting the value of each
byte in the buffer.

When deserializing, `JSON.parse` will only turn that JSON *presentation* into a plain JavaScript
object, to turn into a `Buffer` object, the data array must be passed to `Buffer.from`:
```js
// 11_USING_BUFFERS/examples/buffers-4.js
const buffer = Buffer.from('👀')
const json = JSON.stringify(buffer) // Calls an object's `toJSON` method
const parsed = JSON.parse(json)
console.log(parsed) // prints { type: 'Buffer', data: [ 240, 159, 145, 128 ] }
console.log(Buffer.from(parsed.data)) // prints <Buffer f0 9f 91 80>

```

When an array of bytes is passed to `Buffer.from` they are converted to a buffer with byte values
corresponding to those numbers:
```txt
$ node buffers-4.js
{ type: 'Buffer', data: [ 240, 159, 145, 128 ] }
<Buffer f0 9f 91 80>

```

## Labs
### Lab 11.1 - Create a Buffer Safely
The index.js file in the lab-1 folder contains the following:
```js
// labs-june-2023/labs/ch-11/labs-1/index.js
'use strict'
const assert = require('assert')
const buffer = Buffer.allocUnsafe(4096)
console.log(buffer)

for (const byte of buffer) assert.equal(byte, 0)
console.log('passed!')

```

Alter the code so that the buffer is safely allocated. Do not explicitly fill the buffer with
anything. If the process prints the buffer and then logs passed!, the exercise was correctly
completed.

#### Solution
```js
// 11_USING_BUFFERS/labs/labs-1/index.js
'use strict'
const assert = require('assert')
// const buffer = Buffer.allocUnsafe(4096)
const buffer = Buffer.alloc(4096)
console.log(buffer)

for (const byte of buffer) assert.equal(byte, 0)
console.log('passed!')

```

```txt
$ node index.js 
<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... 4046 more bytes>
passed!

```

### Lab 11.2 - Convert a String to base64 Encoded String by Using a Buffer
The labs-2 index.js file has the following code:
```js
// labs-june-2023/labs/ch-11/labs-2/index.js
'use strict'
const assert = require('assert')
const str = 'buffers are neat'
const base64 = '' // convert str to base64

console.log(base64)

assert.equal(base64, Buffer.from([
  89,110,86,109,90,109,86,121,99,
  121,66,104,99,109,85,103,98,109,
  86,104,100,65,61,61]))

console.log('passed!')

```

Using the `Buffer` API in some way, edit the code so that the `base64` constant contains a
Base64 representation of the `str` constant.

If the process prints the Base64 string and then logs "passed!", the exercise was correctly
completed.

#### Solution
```js
// 11_USING_BUFFERS/labs/labs-2/index.js
'use strict'
const assert = require('assert')
const str = 'buffers are neat'
// Transform the string to a `Buffer` object and convert it to string usinf `base64` encoding
const base64 = Buffer.from(str).toString('base64')

console.log(base64)

assert.equal(base64, Buffer.from([
  89,110,86,109,90,109,86,121,99,
  121,66,104,99,109,85,103,98,109,
  86,104,100,65,61,61]))

console.log('passed!')

```

```txt
$ node index.js 
YnVmZmVycyBhcmUgbmVhdA==
passed!

```

## Knowledge Check
### Question 11.1
What does Buffer inherit from?
- A. Int8Array
- B. Uint8Array [x]
- C. Float64Array

### Question 11.2
What is the difference between `Buffer.alloc` and `Buffer.allocUnsafe`?
- A. `Buffer.allocUnsafe` will cause memory leaks whereas `Buffer.alloc` will not
- B. `Buffer.allocUnsafe` does not clean input while `Buffer.alloc` does
- C. `Buffer.allocUnsafe` does not zero-fill the buffer whereas `Buffer.alloc` does [x]

### Question 11.3
When calling `toString` or concatenating a `Buffer` instance with another string, what is the
default encoding used to perform the conversion from binary data to a string?
- A. HEX
- B. UTF8 [x]
- C. UCS
