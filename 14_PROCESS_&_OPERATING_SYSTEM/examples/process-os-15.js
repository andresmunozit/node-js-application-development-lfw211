'use strict'
const outputStats = () => {
    const uptime = process.uptime()
    const { user, system } = process.cpuUsage()
    // We print the following so we can compare the `uptime` with the other stats
    console.log(uptime, user, system, (user + system)/1000000)
}

// We print the stats when the process starts
outputStats()

setTimeout(() => {
    // We print the stats again after 500ms
    outputStats()
    const now = Date.now()
    // Make the CPU do some work for roughly 5 seconds:
    while(Date.now() - now < 5000){} // `Date.now()` returns the number of millisecods from EPOCH
    // Print the stats one last time
    outputStats()
}, 500)
