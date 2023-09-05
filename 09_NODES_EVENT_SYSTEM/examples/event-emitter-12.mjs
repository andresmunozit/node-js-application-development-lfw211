import { once, EventEmitter } from 'events'
import { setTimeout } from 'timers/promises'

const sometimesLaggy = new EventEmitter()

const ac = new AbortController()
const { signal } = ac

// The second argument can be used to specify the resolved value of the timeout promise 
setTimeout(2000 * Math.random(), null, { signal }).then(() => {
    // The "ping" event will be emitted if the random timeout is roughly under 500 milliseconds,
    // as `ac.abort` gets triggered around that mark.
    sometimesLaggy.emit('ping')
})

// `ac.abort` is used to cancel both the `event.once` promise, and the first `timers/promises`
// `setTimeout` promise afer 500 milliseconds
setTimeout(500).then(() => ac.abort())

try {
    await once(sometimesLaggy, 'ping', { signal })
    console.log('Pinged')
} catch(err) {
    // ignore abort errors
    if (err.code !== 'ABORT_ERR') throw err
    console.log('canceled')
}
