
// The events module exports an EventEmitter constructor
// const { EventEmitter } = require('events')

// In modern node the events module is the `EventEmitter` constructor as well, both forms are fine
const EventEmitter =  require('events')

const myEmitter = new EventEmitter()