#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Check attribute order in Vue templates and optionally rewrite it.
 *
 * Implements the project's strict `vue/attributes-order` configuration
 * (DEFINITION → … → CONTENT, alphabetical inside a group) without ESLint:
 * the rule logic lives in `scripts/lib/vueAttributeOrder.mjs`.
 *
 * Usage: node scripts/check-vue-attribute-order.mjs [path ...] [--fix]
 *
 * Exit code: 1 when violations remain, 0 when clean (also after `--fix`).
 */
import { NodeTypes, parse as parseTemplate } from '@vue/compiler-dom'
import { parse as parseSfc } from '@vue/compiler-sfc'

import {
  buildAttributeOrderFix,
  findOrderViolations,
  isBind,
} from './lib/vueAttributeOrder.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_PATHS = ['src']
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'out',
  'coverage',
  'resources',
])
const isWindows = process.platform === 'win32'

const resolveCommand = (command) => {
  const local = path.join(
    ROOT,
    'node_modules',
    '.bin',
    isWindows ? `${command}.cmd` : command,
  )
  return existsSync(local) ? local : command
}

/** Short human-readable attribute name for diagnostics (`class`, `:foo`, `@click`). */
function attributeLabel(prop) {
  if (prop.type !== NodeTypes.DIRECTIVE) {
    return prop.name
  }
  if (isBind(prop)) {
    return prop.arg ? `:${prop.arg.content}` : 'v-bind'
  }
  if (prop.name === 'on') {
    return prop.arg ? `@${prop.arg.content}` : 'v-on'
  }
  if (prop.name === 'slot') {
    return prop.arg ? `#${prop.arg.content}` : 'v-slot'
  }
  return `v-${prop.name}${prop.arg ? `:${prop.arg.content}` : ''}`
}

async function collectVueFiles(target) {
  const info = await stat(target)
  if (info.isFile()) {
    return target.endsWith('.vue') ? [target] : []
  }

  const files = []
  for (const entry of await readdir(target, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) {
      continue
    }
    const full = path.join(target, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectVueFiles(full)))
    } else if (entry.name.endsWith('.vue')) {
      files.push(full)
    }
  }
  return files
}

/** Analyze one SFC: collect violations and (optionally) rewrite edits. */
function analyze(file, source, { collectFixes }) {
  const { descriptor } = parseSfc(source, { filename: file })
  const { template } = descriptor
  if (!template || (template.lang && template.lang !== 'html')) {
    return { violations: [], fixes: [] }
  }

  const ast = parseTemplate(template.content, { comments: false })
  const { offset } = template.loc.start
  const baseLine = template.loc.start.line
  const violations = []
  const fixes = []

  const visit = (node) => {
    if (node.type === NodeTypes.ELEMENT) {
      for (const { current, previous } of findOrderViolations(node.props)) {
        violations.push({
          file,
          line: baseLine + current.loc.start.line - 1,
          message: `attribute "${attributeLabel(current)}" should go before "${attributeLabel(previous)}"`,
        })
      }

      if (collectFixes) {
        const fix = buildAttributeOrderFix(source, node.props, offset)
        if (fix) {
          fixes.push(fix)
        }
      }
    }

    for (const child of node.children ?? []) {
      visit(child)
    }
    if (node.branches) {
      for (const branch of node.branches) {
        visit(branch)
      }
    }
  }

  visit(ast)
  return { violations, fixes }
}

const applyFixes = (source, fixes) =>
  [...fixes]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (text, fix) => text.slice(0, fix.start) + fix.text + text.slice(fix.end),
      source,
    )

const printViolations = (violations) => {
  for (const violation of violations) {
    console.log(`${violation.file}:${violation.line}: ${violation.message}`)
  }
}

async function fixFiles(files, results) {
  const changed = []

  for (const { file, source, fixes } of results) {
    if (fixes.length === 0) {
      continue
    }
    const updated = applyFixes(source, fixes)
    if (updated !== source) {
      await writeFile(file, updated, 'utf8')
      changed.push(file)
    }
  }

  if (changed.length > 0) {
    const formatted = spawnSync(resolveCommand('oxfmt'), changed, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'ignore',
    })
    if (formatted.error) {
      process.stderr.write(
        `[vue-attrs] could not run oxfmt: ${formatted.error.message}\n`,
      )
    }
  }

  return changed
}

function usage() {
  console.log(
    'Usage: node scripts/check-vue-attribute-order.mjs [path ...] [--fix]',
  )
  console.log('')
  console.log(
    'Checks the order of attributes in Vue templates (strict project order,',
  )
  console.log(
    'alphabetical inside a group). --fix rewrites the affected start tags.',
  )
  console.log('Exit code 1 when violations remain.')
}

async function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    usage()
    return 0
  }

  const shouldFix = argv.includes('--fix')
  const targets = argv.filter((arg) => !arg.startsWith('-'))
  const files = (
    await Promise.all(
      (targets.length > 0 ? targets : DEFAULT_PATHS).map(collectVueFiles),
    )
  ).flat()

  if (files.length === 0) {
    console.log('No .vue files found.')
    return 0
  }

  const results = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const { violations, fixes } = analyze(file, source, {
      collectFixes: shouldFix,
    })
    results.push({ file, source, violations, fixes })
  }

  if (!shouldFix) {
    const violations = results.flatMap((result) => result.violations)
    printViolations(violations)
    if (violations.length > 0) {
      console.log(
        `\nFound ${violations.length} attribute order violations in ${results.filter((r) => r.violations.length > 0).length} files.`,
      )
      console.log('Run `npm run fix:vue-attrs` to reorder them automatically.')
      return 1
    }
    return 0
  }

  const changed = await fixFiles(files, results)

  // Re-check after rewriting: tags with `v-bind="object"` and repeated names
  // are reported but intentionally left untouched.
  const remaining = []
  for (const file of changed) {
    const source = await readFile(file, 'utf8')
    remaining.push(...analyze(file, source, { collectFixes: false }).violations)
  }

  if (changed.length > 0) {
    console.log(`Reordered start tags in ${changed.length} files.`)
  }
  printViolations(remaining)
  if (remaining.length > 0) {
    console.log(`\n${remaining.length} violations require manual review.`)
    return 1
  }
  return 0
}

process.exitCode = await main(process.argv.slice(2))
