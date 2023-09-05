import { once, EventEmitter } from 'events'
import { setTimeout } from 'timers/promises'

const sometimesLaggy = new EventEmitter()

const ac = new AbortController()
const { signal } = ac

setTimeout(2000 * Math.random(), null, { signal })
    .then(() => {
        sometimesLaggy.emit('ping')
    })
    .catch((err) => {if (err.code !== 'ABORT_ERR') throw err})  // This will handle the async
                                                                // operation cancellation caused by
                                                                // `ac.abort` call

setTimeout(500).then(() => ac.abort())
    
try {
    await once(sometimesLaggy, 'ping', { signal })
    console.log('Pinged')
} catch(err) {
    if (err.code !== 'ABORT_ERR') throw err
    console.log('canceled')
}
