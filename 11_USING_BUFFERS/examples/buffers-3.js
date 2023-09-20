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