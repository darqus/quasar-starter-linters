#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/**
 * Fails when a Vue single-file component contains a static `style="..."`
 * attribute.
 *
 * Static styles belong to layered SCSS modules under `src/css/` (see
 * STYLE_GUIDE.md). Dynamic `:style` bindings are allowed: they express
 * values that only exist at runtime.
 *
 * Usage: node scripts/check-no-inline-styles.mjs [dir ...]
 *
 * Exit code: 1 when a static style is found, 0 when clean.
 */
import { findInlineStyles, formatInlineStyle } from './lib/inlineStyles.mjs'
import { collectVueFiles } from './lib/vueFiles.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DEFAULT_DIRS = [path.join(ROOT, 'src')]

const targets = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
const dirs =
  targets.length > 0 ? targets.map((dir) => path.resolve(dir)) : DEFAULT_DIRS

const files = (await Promise.all(dirs.map(collectVueFiles))).flat()
const violations = []

for (const file of files) {
  const source = await readFile(file, 'utf8')

  for (const violation of findInlineStyles(source, file)) {
    violations.push({
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      violation,
    })
  }
}

if (violations.length === 0) {
  process.exit(0)
}

console.error('Static style attributes are not allowed in Vue components.')
console.error(
  'Use a class backed by a layered SCSS partial in src/css/ (see src/css/STYLE_GUIDE.md).\n',
)

for (const { file, violation } of violations) {
  console.error(`  ${file}: ${formatInlineStyle(violation)}`)
}

process.exit(1)
