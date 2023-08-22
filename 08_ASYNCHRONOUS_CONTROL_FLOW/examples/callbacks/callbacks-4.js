const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFille ] = Array.from(Array(3)).fill(__filename)
const data = []
const print = (err, contents) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(contents.toString())
}

readFile(bigFile, (err, contents) => {
    if (err) print(err)
    else data.push(contents)
    readFile(mediumFile, (err, contents) => {
        if (err) print(err)
        else data.push(contents)
        readFile(mediumFile, (err, contents) => {
            if (err) print(err)
            else data.push(contents)
            // The use of `Buffer.concat` here takes the three buffer objects in the data array and
            // concatenates them together
            print(null, Buffer.concat(data))
        }) 
    })
})
