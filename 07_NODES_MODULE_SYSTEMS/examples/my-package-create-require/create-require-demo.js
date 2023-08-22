import { pathToFileURL } from 'url'
import { createRequire } from 'module'

// `import.meta.url`: The absolute `file:` URL of the module
// `createRequire: Takes a filename and use it to construct a require function`
const require = createRequire(import.meta.url)

console.log(
    `import 'pino'`,
    '=>',
    // `pathToFileURL`: This function converts the path to an absolute, properly encoded File URL
    pathToFileURL(require.resolve('pino')).toString()
)
