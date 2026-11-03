import { parse as parseSfc } from '@vue/compiler-sfc'

/**
 * Project rule: component styles live in layered SCSS modules under
 * `src/css/`, never in Vue single-file components. This module is the
 * pure part of the guard that enforces it.
 */
export function findStyleBlocks(source, filename = 'Component.vue') {
  const { descriptor, errors } = parseSfc(source, { filename })

  // Malformed SFCs are reported by the compiler and the editor; the guard
  // only speaks about style blocks, so it stays silent here.
  if (errors.length > 0) {
    return []
  }

  return descriptor.styles.map((block) => ({
    line: block.loc.start.line,
    lang: block.lang ?? 'css',
    scoped: block.scoped === true,
  }))
}

export function formatStyleBlock(block) {
  const flags = [block.lang, block.scoped ? 'scoped' : '']
    .filter((flag) => flag !== '')
    .join(', ')

  return `line ${block.line} (<style ${flags}>)`
}
