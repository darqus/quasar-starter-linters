import { describe, expect, it } from 'vitest'

import { findInlineStyles, formatInlineStyle } from './inlineStyles.mjs'

const sfc = (template, script = '<script setup lang="ts"></script>') => `
${script}
<template>
${template}
</template>
`

describe('findInlineStyles', () => {
  it('reports a static style attribute', () => {
    const source = sfc('<div style="margin-top: 8px">Text</div>')

    expect(findInlineStyles(source)).toEqual([
      { line: 4, value: 'margin-top: 8px' },
    ])
  })

  it('allows a dynamic :style binding', () => {
    const source = sfc('<div :style="{ color: color }">Text</div>')

    expect(findInlineStyles(source)).toEqual([])
  })

  it('allows v-bind:style with an argument', () => {
    const source = sfc('<div v-bind:style="styles">Text</div>')

    expect(findInlineStyles(source)).toEqual([])
  })

  it('reports every element with a static style', () => {
    const source = sfc(`
      <div style="color: red">
        <span style="font-weight: 600">Text</span>
      </div>
    `)

    expect(findInlineStyles(source)).toHaveLength(2)
  })

  it('ignores style= inside comments', () => {
    const source = sfc('<!-- <div style="color: red"> --><div>Text</div>')

    expect(findInlineStyles(source)).toEqual([])
  })

  it('ignores non-html templates', () => {
    const source = `
<script setup lang="ts"></script>
<template lang="pug">
div(style="color: red")
</template>
`

    expect(findInlineStyles(source)).toEqual([])
  })

  it('stays silent on a malformed SFC', () => {
    const source = '<template><div style="color: red"></template>'

    expect(findInlineStyles(source)).toEqual([])
  })
})

describe('formatInlineStyle', () => {
  it('keeps short values intact', () => {
    expect(formatInlineStyle({ line: 3, value: 'color: red' })).toBe(
      'line 3 (style="color: red")',
    )
  })

  it('truncates long values', () => {
    const formatted = formatInlineStyle({
      line: 3,
      value:
        'background: linear-gradient(90deg, red, blue, green, white, black)',
    })

    expect(formatted).toContain('...')
    expect(formatted.length).toBeLessThan(70)
  })
})
