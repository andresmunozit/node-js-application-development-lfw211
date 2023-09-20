const buffer = Buffer.from('👀')
const json = JSON.stringify(buffer) // Calls an object's `toJSON` method
const parsed = JSON.parse(json)
console.log(parsed) // prints { type: 'Buffer', data: [ 240, 159, 145, 128 ] }
console.log(Buffer.from(parsed.data)) // prints <Buffer f0 9f 91 80>
