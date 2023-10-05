'use strict'
// Creates a new Server instance. The `requestListener` function auto-attaches to the 'request'
// event.
const { createServer } = require('http')
const { Readable, Transform, pipeline } = require('stream')
// Open a directory asynchronously using `fs.Dir`, which manages directory read and cleanup
// operations. Refer to POSIX opendir(3) for details
const { opendir } = require('fs')

// Create a Transform stream to format directory entries for JSON output.
// It receives `fs.Dirent` objects and outputs buffers.
const createEntryStream = () => {
    let syntax = '[\n'
    return new  Transform({
        writableObjectMode: true, // Accepts `fs.Dirent` objects
        readableObjectMode: false, // Outputs buffers

        // Accepts `fs.Dirent` objects, prepends a JSON prefix, and outputs formatted strings.
        transform(entry, enc, next) {
            // `syntax = '[\n'` will be the first element prepended e.g.:
            // entry.name = 'file1' -> transform  -> '[\nfile1'
            next(null, `${syntax} "${entry.name}"`)
            // After the first entry has writen, `syntax = ',\n'` will be prepended e.g.:
            // entry.name = 'file2' -> transform  -> ',\nfile2'
            syntax = ',\n'
        },

        // Close the JSON array before ending the stream
        final (cb) {
            this.push('\n]\n')
            cb()
        }
    })
}

createServer((req, res) => {
    if (req.url !== '/') {
        res.statusCode = 404
        res.end('Not Found')
        return
    }
    // Open the current directory and get the entries asynchronously
    opendir(__dirname, (err, dir) =>  {
        if (err) {
            res.statusCode = 500
            res.end('Server Error')
            return
        }
        // Convert the async iterable directory entries into a readable stream
        const dirStream = Readable.from(dir)

        // Get the transform stream for JSON formatting
        const entryStream = createEntryStream()
        res.setHeader('Content-Type', 'application/json')

        // Pipe the directory entries through our transform stream, then to the HTTP response
        pipeline(dirStream, entryStream, res, (err) => {
            if (err) console.log(err)
        })
    })
}).listen(3000)
