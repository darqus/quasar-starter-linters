import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')
const TOKENS_JSON = path.join(ROOT, 'tokens/app.json')
const TOKENS_SCSS = path.join(ROOT, 'src/css/_tokens.scss')

/**
 * Flatten a DTCG token tree into `--name` -> value pairs, mirroring the
 * naming Style Dictionary uses in scripts/build-tokens.mjs.
 */
function flattenTokens(node, prefix = []) {
  const entries = []

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue
    }

    if (value && typeof value === 'object' && 'value' in value) {
      entries.push([`--${[...prefix, key].join('-')}`, String(value.value)])
    } else if (value && typeof value === 'object') {
      entries.push(...flattenTokens(value, [...prefix, key]))
    }
  }

  return entries
}

function parseGeneratedScss(source) {
  const tokens = new Map()
  const pattern = /^\s*(--[\w-]+):\s*(.+);$/gm

  for (const match of source.matchAll(pattern)) {
    tokens.set(match[1], match[2].trim())
  }

  return tokens
}

describe('design tokens', () => {
  it('keeps src/css/_tokens.scss in sync with tokens/app.json', async () => {
    const [tokensJson, tokensScss] = await Promise.all([
      readFile(TOKENS_JSON, 'utf8'),
      readFile(TOKENS_SCSS, 'utf8'),
    ])

    const expected = Object.fromEntries(flattenTokens(JSON.parse(tokensJson)))
    const generated = Object.fromEntries(parseGeneratedScss(tokensScss))

    expect(generated).toEqual(expected)
  })

  it('declares the generated variables inside the tokens layer', async () => {
    const source = await readFile(TOKENS_SCSS, 'utf8')

    expect(source).toContain('@layer tokens {')
  })
})
