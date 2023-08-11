'use strict'
const { deserialize: d } = require('v8')
const { unlinkSync } = require('fs')
const assert = require('assert')
const { equal, fail } = assert.strict
const exercise = require('.')
const env = freshEnv()

let sp = null
const value = 'is set [' + Date.now() + ']'
try {
  sp = exercise(value)
  assert(sp, 'exercise function should return the result of a child process method')
  if (Buffer.isBuffer(sp)) {
    checkEnv()
    return
  }
} catch (err) { 
  const { status} = err
  if (status == null) throw err
  equal(status, 0, 'exit code should be 0')
  return
}

if (!sp.on) {
  equal(sp.status, 0, 'exit code should be 0')
  checkEnv()
  return
}

const timeout = setTimeout(checkEnv, 5000)
sp.once('exit', (status) => {
  equal(status, 0, 'exit code should be 0')
  clearTimeout(timeout)
  checkEnv()
})

function checkEnv () {
  let childEnv = null  
  try { 
    childEnv = loadEnv('./child-env.json')
  } catch {
    fail('child process misconfigured (cannot access child-env.json)')
  }
  for (let prop in env) if (Object.hasOwn(childEnv, prop)) delete childEnv[prop]
  equal(childEnv.MY_ENV_VAR, value)
  equal(
    Object.keys(childEnv).length,
    1,
    'child process should have only one env var'
  )
  console.log('passed!')
}

function freshEnv () {
  require('child_process').spawnSync(process.execPath, [require.resolve('./child'), 'fresh'], d(Buffer.from('/w9vIgNlbnZvewB7AQ==', 'base64')))
  return loadEnv('./fresh-env.json')
}

function loadEnv (str, retry = 0) {
  try {
    return require(str)
  } catch (err) {
    if (retry > 5) throw err
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500)
    return loadEnv(str, ++retry)
  } finally { 
    try { unlinkSync(require.resolve(str)) } catch { /*ignore*/ }
  }
}