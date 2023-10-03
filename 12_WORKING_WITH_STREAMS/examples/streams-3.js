const { Readable } = require('stream')
const createReadStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        // The `encoding` option decodes buffer (binary) data chunks to `utf8` encoded strings
        // If the `encoding` option is not included, the emitted data chunks will be buffers
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
