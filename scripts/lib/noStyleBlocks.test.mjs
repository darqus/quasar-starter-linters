import { describe, expect, it } from 'vitest'

import { findStyleBlocks, formatStyleBlock } from './noStyleBlocks.mjs'

const sfc = (blocks) => `<template><div /></template>
${blocks}`

describe('findStyleBlocks', () => {
  it('returns nothing for a component without styles', () => {
    expect(findStyleBlocks(sfc(''))).toEqual([])
  })

  it('detects a scoped CSS block', () => {
    const source = sfc('<style scoped>\n.a { color: red; }\n</style>')

    expect(findStyleBlocks(source)).toEqual([
      { line: 2, lang: 'css', scoped: true },
    ])
  })

  it('reports the language and line of an SCSS block', () => {
    const source = `<template><div /></template>

<script setup lang="ts">
const a = 1
</script>

<style lang="scss">
.a { color: red; }
</style>`

    expect(findStyleBlocks(source)).toEqual([
      { line: 7, lang: 'scss', scoped: false },
    ])
  })

  it('detects every style block of a component', () => {
    const source = `<template><div /></template>
<style>.a { color: red; }</style>
<style scoped lang="scss">.b { color: blue; }</style>`

    expect(findStyleBlocks(source).map((block) => block.line)).toEqual([2, 3])
  })

  it('ignores markup that only looks like a style block', () => {
    const source = `<template>
  <div>
    <!-- <style>.a { color: red; }</style> -->
    <component :is="'style'" />
  </div>
</template>

<script setup lang="ts">
const snippet = '<style>.a { color: red; }</style>'
console.log(snippet)
</script>`

    expect(findStyleBlocks(source)).toEqual([])
  })

  it('stays silent about malformed components', () => {
    expect(findStyleBlocks('<template><div></template>')).toEqual([])
  })
})

describe('formatStyleBlock', () => {
  it('describes a scoped SCSS block', () => {
    expect(formatStyleBlock({ line: 4, lang: 'scss', scoped: true })).toBe(
      'line 4 (<style scss, scoped>)',
    )
  })

  it('describes a plain CSS block', () => {
    expect(formatStyleBlock({ line: 7, lang: 'css', scoped: false })).toBe(
      'line 7 (<style css>)',
    )
  })
})
