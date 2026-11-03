#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/**
 * Fails when a Vue single-file component contains a `<style>` block.
 *
 * Styles are SCSS modules under `src/css/` (see STYLE_GUIDE.md); keeping
 * them out of SFCs is what makes the cascade layers, design tokens and BEM
 * namespaces enforceable in one place.
 *
 * Usage: node scripts/check-no-style-blocks.mjs [dir ...]
 *
 * Exit code: 1 when a style block is found, 0 when clean.
 */
import { findStyleBlocks, formatStyleBlock } from './lib/noStyleBlocks.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DEFAULT_DIRS = [path.join(ROOT, 'src')]

async function collectVueFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        return entry.name === 'node_modules' ? [] : collectVueFiles(entryPath)
      }

      return entry.isFile() && entry.name.endsWith('.vue') ? [entryPath] : []
    }),
  )

  return files.flat()
}

const targets = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
const dirs =
  targets.length > 0 ? targets.map((dir) => path.resolve(dir)) : DEFAULT_DIRS

const files = (await Promise.all(dirs.map(collectVueFiles))).flat()
const violations = []

for (const file of files.sort((a, b) => a.localeCompare(b))) {
  const source = await readFile(file, 'utf8')
  const blocks = findStyleBlocks(source, file)

  for (const block of blocks) {
    violations.push({
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      block,
    })
  }
}

if (violations.length === 0) {
  process.exit(0)
}

console.error('Style blocks are not allowed in Vue components.')
console.error(
  'Move them to a layered SCSS module in src/css/ (see src/css/STYLE_GUIDE.md).\n',
)

for (const { file, block } of violations) {
  console.error(`  ${file}: ${formatStyleBlock(block)}`)
}

process.exit(1)
