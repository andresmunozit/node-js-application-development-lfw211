const print = (err, contents) => { 
  if (err) console.error(err)
  else console.log(contents )
}

const opA = (cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
}

const opB = (cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
}

const opC = (cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
}

// These operations run in parallel. The order in which the letters (C, B, A) are printed reflects 
// the durations set in the timers.
// The call order stated in the exercise was respected.
opA(print)
opB(print)
opC(print)
