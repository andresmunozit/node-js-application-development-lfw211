import { once, EventEmitter } from 'events'
import { setTimeout } from 'timers/promises'

// `uneventful` event emitter never emits `ping`
const uneventful = new EventEmitter()

const ac = new AbortController()
const { signal } = ac

// After 500 milliseconds `ac.abort` is called, this causes the `signal` instance passed to
// `events.once` to reject the returned promise with an `AbortError`
setTimeout(500).then(() => ac.abort())

try {
    await once(uneventful, 'ping', { signal })
    console.log('pinged!')
} catch(err) {
    // ignore abort errors
    if (err.code !== 'ABORT_ERR') throw err
    console.log('canceled')
}
