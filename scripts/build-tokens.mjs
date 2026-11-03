// Generates app design tokens from tokens/app.json:
//   - src/css/_tokens.scss (CSS custom properties inside @layer tokens)
// Run: npm run build:tokens
import path from 'node:path'

import { buildTokens } from './lib/buildTokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')

await buildTokens({
  source: path.join(ROOT, 'tokens/app.json'),
  outputDir: path.join(ROOT, 'src/css'),
})

console.log('tokens: generated src/css/_tokens.scss')
