import { NodeTypes, parse as parseTemplate } from '@vue/compiler-dom'
import { parse as parseSfc } from '@vue/compiler-sfc'

import { describe, expect, it } from 'vitest'

import {
  ATTRIBUTE_GROUPS,
  attributeName,
  buildAttributeOrderFix,
  classifyAttribute,
  findOrderViolations,
  sortAttributes,
} from './vueAttributeOrder.mjs'

const elementProps = (attributes) => {
  const ast = parseTemplate(`<div ${attributes}></div>`)
  const element = ast.children.find((node) => node.type === NodeTypes.ELEMENT)
  return element.props
}

const classify = (attribute) => classifyAttribute(elementProps(attribute)[0])

const violationLabels = (attributes) =>
  findOrderViolations(elementProps(attributes)).map(
    ({ current, previous }) =>
      `${attributeName(current)} before ${attributeName(previous)}`,
  )

const fixTemplate = (source) => {
  const { descriptor } = parseSfc(source)
  const ast = parseTemplate(descriptor.template.content)
  const element = ast.children.find((node) => node.type === NodeTypes.ELEMENT)
  const fix = buildAttributeOrderFix(
    source,
    element.props,
    descriptor.template.loc.start.offset,
  )
  return fix
    ? source.slice(0, fix.start) + fix.text + source.slice(fix.end)
    : source
}

describe('classifyAttribute', () => {
  it.each([
    [':is="view"', ATTRIBUTE_GROUPS.DEFINITION],
    ['v-is="view"', ATTRIBUTE_GROUPS.DEFINITION],
    ['is="view"', ATTRIBUTE_GROUPS.DEFINITION],
    ['v-for="item in items"', ATTRIBUTE_GROUPS.LIST_RENDERING],
    ['v-if="ok"', ATTRIBUTE_GROUPS.CONDITIONALS],
    ['v-else-if="ok"', ATTRIBUTE_GROUPS.CONDITIONALS],
    ['v-else', ATTRIBUTE_GROUPS.CONDITIONALS],
    ['v-show="ok"', ATTRIBUTE_GROUPS.CONDITIONALS],
    ['v-cloak', ATTRIBUTE_GROUPS.CONDITIONALS],
    ['v-once', ATTRIBUTE_GROUPS.RENDER_MODIFIERS],
    ['id="row"', ATTRIBUTE_GROUPS.GLOBAL],
    ['ref="input"', ATTRIBUTE_GROUPS.UNIQUE],
    ['key="id"', ATTRIBUTE_GROUPS.UNIQUE],
    ['v-slot:header', ATTRIBUTE_GROUPS.SLOT],
    ['#header', ATTRIBUTE_GROUPS.SLOT],
    ['slot="header"', ATTRIBUTE_GROUPS.SLOT],
    ['slot-scope="scope"', ATTRIBUTE_GROUPS.SLOT],
    ['v-model="value"', ATTRIBUTE_GROUPS.TWO_WAY_BINDING],
    ['v-custom:arg', ATTRIBUTE_GROUPS.OTHER_DIRECTIVES],
    [':title="text"', ATTRIBUTE_GROUPS.ATTR_DYNAMIC],
    ['title="text"', ATTRIBUTE_GROUPS.ATTR_STATIC],
    ['disabled', ATTRIBUTE_GROUPS.ATTR_SHORTHAND_BOOL],
    ['@click="run"', ATTRIBUTE_GROUPS.EVENTS],
    ['v-on="listeners"', ATTRIBUTE_GROUPS.EVENTS],
    ['v-text="text"', ATTRIBUTE_GROUPS.CONTENT],
    ['v-html="html"', ATTRIBUTE_GROUPS.CONTENT],
  ])('%s → %s', (attribute, group) => {
    expect(classify(attribute)).toBe(group)
  })
})

describe('attributeName', () => {
  it('uses the bound target for v-bind and the full directive for others', () => {
    expect(attributeName(elementProps(':title="t"')[0])).toBe('title')
    expect(attributeName(elementProps('v-bind:title="t"')[0])).toBe('title')
    expect(attributeName(elementProps('@click="run"')[0])).toBe('v-on:click')
    expect(attributeName(elementProps('v-slot:header.ok')[0])).toBe(
      'v-slot:header.ok',
    )
    expect(attributeName(elementProps('class="a"')[0])).toBe('class')
  })
})

describe('findOrderViolations', () => {
  it('accepts a correctly ordered tag', () => {
    expect(
      violationLabels(
        'is="view" v-for="item in items" v-if="ok" v-model="value" class="a" @click="run"',
      ),
    ).toEqual([])
  })

  it('reports group order violations', () => {
    expect(violationLabels('class="a" v-if="ok"')).toEqual([
      'v-if before class',
    ])
    expect(violationLabels('@click="run" :title="title"')).toEqual([
      'title before v-on:click',
    ])
  })

  it('reports alphabetical violations inside one group', () => {
    expect(violationLabels('zebra="1" alpha="2"')).toEqual([
      'alpha before zebra',
    ])
    expect(violationLabels('@submit="a" @click="b"')).toEqual([
      'v-on:click before v-on:submit',
    ])
  })

  it('keeps reporting against the last valid attribute', () => {
    expect(violationLabels('class="a" v-if="b" v-for="c in d"')).toEqual([
      'v-if before class',
      'v-for before class',
    ])
  })

  it('puts dynamic attributes before static ones', () => {
    expect(violationLabels('foo="a" :foo="b"')).toEqual(['foo before foo'])
    expect(violationLabels(':foo="b" foo="a"')).toEqual([])
  })

  it('skips v-bind="object" next to an explicit binding', () => {
    expect(violationLabels('class="a" v-bind="attrs" @click="run"')).toEqual([])
    expect(violationLabels('v-bind="attrs" class="a"')).toEqual([])
  })

  it('uses the next binding position for a lone v-bind="object"', () => {
    expect(violationLabels('v-bind="attrs" @click="run" class="a"')).toEqual([
      'class before v-on:click',
    ])
  })
})

describe('sortAttributes', () => {
  it('orders groups and sorts alphabetically inside a group', () => {
    const props = elementProps('@click="run" zebra="1" v-if="ok" alpha="2"')
    expect(sortAttributes(props).map(attributeName)).toEqual([
      'v-if',
      'alpha',
      'zebra',
      'v-on:click',
    ])
  })

  it('puts dynamic attributes before static ones', () => {
    const props = elementProps('foo="a" :foo="b"')
    expect(sortAttributes(props).map((prop) => prop.loc.start.offset)).toEqual([
      props[1].loc.start.offset,
      props[0].loc.start.offset,
    ])
  })
})

describe('buildAttributeOrderFix', () => {
  it('rewrites a multiline start tag keeping the indentation separator', () => {
    const source = [
      '<template>',
      '  <div',
      '    @click="run"',
      '    v-if="ok"',
      '    class="a"',
      '  >text</div>',
      '</template>',
      '',
    ].join('\n')

    expect(fixTemplate(source)).toBe(
      [
        '<template>',
        '  <div',
        '    v-if="ok"',
        '    class="a"',
        '    @click="run"',
        '  >text</div>',
        '</template>',
        '',
      ].join('\n'),
    )
  })

  it('rewrites an inline start tag with spaces', () => {
    const source = '<template><div b="1" a="2">x</div></template>'
    expect(fixTemplate(source)).toBe(
      '<template><div a="2" b="1">x</div></template>',
    )
  })

  it('is idempotent for an already ordered tag', () => {
    const source =
      '<template>\n  <div class="a" title="b">x</div>\n</template>\n'
    expect(fixTemplate(source)).toBe(source)
  })

  it('refuses position-sensitive, duplicated and v-pre attributes', () => {
    const bindObject =
      '<template>\n  <div class="a" v-bind="attrs">x</div>\n</template>\n'
    const duplicate =
      '<template>\n  <div :foo="a" foo="b">x</div>\n</template>\n'
    const vPre =
      '<template>\n  <div class="a" v-pre id="b">x</div>\n</template>\n'

    expect(fixTemplate(bindObject)).toBe(bindObject)
    expect(fixTemplate(duplicate)).toBe(duplicate)
    expect(fixTemplate(vPre)).toBe(vPre)
  })

  it('reorders merged class/style bindings', () => {
    const source =
      '<template>\n  <div class="a" :class="b">x</div>\n</template>\n'
    expect(fixTemplate(source)).toBe(
      '<template>\n  <div :class="b" class="a">x</div>\n</template>\n',
    )
  })
})
