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
- `Buffer.prototype.slice` will return a `Buffer` instance that *references* the binary data of the
original buffer that `slice` was called on:
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
Unicode symbols work, but that's out of scope for this subject. You can find more information
[here](https://mathiasbynens.be/notes/javascript-unicode)

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

When the first argument of `Buffer.from` is a string, we can provide a second argument to set the
encoding. There are two types of encodings in this context, *character encodings* and
*binary-to-text encodings*

UTF8 and UTF16LE are of type character encoding. When we use different encoding it results in a
buffer with different byte values:
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
