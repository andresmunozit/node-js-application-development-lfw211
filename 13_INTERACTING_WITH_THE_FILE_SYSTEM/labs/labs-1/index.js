'use strict'
const assert = require('assert')
const { join, basename } = require('path')
const fs = require('fs') // Note that the entire `fs` API is imported
const project = join(__dirname, 'project')
try { fs.rmdirSync(project, { recursive: true }) } catch (err) { }
const files = Array.from(Array(5), () => {
	return join(project, Math.random().toString(36).slice(2))
})
files.sort()
fs.mkdirSync(project)
for (const f of files) fs.closeSync(fs.openSync(f, 'w'))

const out = join(__dirname, 'out.txt')

function exercise() {
	// Read the files in the `project` folder
	const files = fs.readdirSync(project)

	// Write the to the `out.txt` file
	fs.writeFileSync(out, files.join(','))
}

exercise()
assert.deepStrictEqual(
	fs.readFileSync(out).toString().split(',').map((s) => s.trim()),
	files.map((f) => basename(f))
)
console.log('passed!')
