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
