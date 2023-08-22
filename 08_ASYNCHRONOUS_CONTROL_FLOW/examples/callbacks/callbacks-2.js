const  { readFile }  =  require('fs')

// `smallFile`, `mediumFile`, and `bigFile` are mocked and they're actually all the current file
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

readFile(bigFile, print)
readFile(mediumFile, print)
readFile(smallFile, print)
