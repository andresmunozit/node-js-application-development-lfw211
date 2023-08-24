const { readFile } = require('fs').promises

readFile(__filename)
    .then((contents) => {
        return contents.toString()
    })
    .then((stringifiedContents) => {
        console.log(stringifiedContents)
    })
    .catch(console.error)
