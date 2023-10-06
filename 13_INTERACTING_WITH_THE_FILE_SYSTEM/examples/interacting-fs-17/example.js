'use strict'
const { watch } = require('fs')

// This will keep the process open and watch the current directory
watch('.', (evt, filename) => {
    // This listener function is called with an event name and the related filename when any changes
    // occur in the directory.
    console.log(evt, filename)
})
