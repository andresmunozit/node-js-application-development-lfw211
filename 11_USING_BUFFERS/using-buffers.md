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
