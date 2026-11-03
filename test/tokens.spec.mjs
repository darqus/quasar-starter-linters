import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { buildTokens } from '../scripts/lib/buildTokens.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const TOKENS_JSON = path.join(ROOT, 'tokens/app.json')
const TOKENS_SCSS = path.join(ROOT, 'src/css/_tokens.scss')
const tempDirs = []

async function generateToTempDir() {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'quasar-tokens-'))
  tempDirs.push(outputDir)

  const output = await buildTokens({ source: TOKENS_JSON, outputDir })
  return readFile(output, 'utf8')
}

afterAll(async () => {
  await Promise.all(
    tempDirs.map((dir) => rm(dir, { recursive: true, force: true })),
  )
})

describe('design tokens', () => {
  it('keeps src/css/_tokens.scss in sync with tokens/app.json', async () => {
    const [committed, generated] = await Promise.all([
      readFile(TOKENS_SCSS, 'utf8'),
      generateToTempDir(),
    ])

    expect(generated).toBe(committed)
  })

  it('declares the generated variables inside the tokens layer', async () => {
    const source = await readFile(TOKENS_SCSS, 'utf8')

    expect(source).toContain('@layer tokens {')
  })
})
