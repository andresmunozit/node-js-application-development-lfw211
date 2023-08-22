import { pathToFileURL } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

console.log(
    `import 'pino'`,
    '=>',
    pathToFileURL(require.resolve('pino')).toString()
)

console.log(
    `import 'tap'`,
    '=>',
    // Since `require` is a CJS API, `require.resolve` function will still resolve to the CJS entry
    // point
    pathToFileURL(require.resolve('tap')).toString()
)
