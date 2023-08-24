const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        console.log(contents.toString())
    })
    .catch(console.error)
    // We pass `console.error` directly to catch instead of using an intermediate function
