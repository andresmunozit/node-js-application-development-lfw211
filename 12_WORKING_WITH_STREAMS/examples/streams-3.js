const { Readable } = require('stream')
const createReadStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        // The `encoding` option decodes buffer (binary) data chunks to `utf8` encoded strings
        encoding: 'utf8',
        read() {
            if (data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadStream()
readable.on('data', (data) => { console.log('got data', data) })
readable.on('end', () => { console.log('finished reading') })
