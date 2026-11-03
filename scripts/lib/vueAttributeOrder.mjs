/**
 * Vue template attribute ordering: a dependency-free port of
 * eslint-plugin-vue's `vue/attributes-order` rule logic on top of the
 * `@vue/compiler-dom` AST.
 *
 * The project's strict order is:
 *   DEFINITION → LIST_RENDERING → CONDITIONALS → RENDER_MODIFIERS → GLOBAL →
 *   [UNIQUE, SLOT] → TWO_WAY_BINDING → OTHER_DIRECTIVES → ATTR_DYNAMIC →
 *   ATTR_STATIC → ATTR_SHORTHAND_BOOL → EVENTS → CONTENT
 * with alphabetical sorting inside a group.
 */
import { NodeTypes } from '@vue/compiler-dom'

export const ATTRIBUTE_GROUPS = Object.freeze({
  DEFINITION: 'DEFINITION',
  LIST_RENDERING: 'LIST_RENDERING',
  CONDITIONALS: 'CONDITIONALS',
  RENDER_MODIFIERS: 'RENDER_MODIFIERS',
  GLOBAL: 'GLOBAL',
  UNIQUE: 'UNIQUE',
  SLOT: 'SLOT',
  TWO_WAY_BINDING: 'TWO_WAY_BINDING',
  OTHER_DIRECTIVES: 'OTHER_DIRECTIVES',
  ATTR_DYNAMIC: 'ATTR_DYNAMIC',
  ATTR_STATIC: 'ATTR_STATIC',
  ATTR_SHORTHAND_BOOL: 'ATTR_SHORTHAND_BOOL',
  EVENTS: 'EVENTS',
  CONTENT: 'CONTENT',
})

export const ATTRIBUTE_ORDER = Object.freeze([
  ATTRIBUTE_GROUPS.DEFINITION,
  ATTRIBUTE_GROUPS.LIST_RENDERING,
  ATTRIBUTE_GROUPS.CONDITIONALS,
  ATTRIBUTE_GROUPS.RENDER_MODIFIERS,
  ATTRIBUTE_GROUPS.GLOBAL,
  [ATTRIBUTE_GROUPS.UNIQUE, ATTRIBUTE_GROUPS.SLOT],
  ATTRIBUTE_GROUPS.TWO_WAY_BINDING,
  ATTRIBUTE_GROUPS.OTHER_DIRECTIVES,
  ATTRIBUTE_GROUPS.ATTR_DYNAMIC,
  ATTRIBUTE_GROUPS.ATTR_STATIC,
  ATTRIBUTE_GROUPS.ATTR_SHORTHAND_BOOL,
  ATTRIBUTE_GROUPS.EVENTS,
  ATTRIBUTE_GROUPS.CONTENT,
])

const GROUP_POSITIONS = new Map()
ATTRIBUTE_ORDER.forEach((entry, position) => {
  for (const group of Array.isArray(entry) ? entry : [entry]) {
    GROUP_POSITIONS.set(group, position)
  }
})

const isDirective = (prop) => prop.type === NodeTypes.DIRECTIVE

export const isBind = (prop) => isDirective(prop) && prop.name === 'bind'

/** `v-bind="object"` without an argument: it overrides bindings by position. */
export const isBindObject = (prop) => isBind(prop) && !prop.arg

const isAttributeOrBindOrModel = (prop) =>
  prop !== undefined &&
  (prop.type === NodeTypes.ATTRIBUTE ||
    (isDirective(prop) && (prop.name === 'bind' || prop.name === 'model')))

const isShorthandBoolean = (prop) =>
  prop.type === NodeTypes.ATTRIBUTE && !prop.value

/** Resolve the order group of one attribute node. */
export function classifyAttribute(prop) {
  // Note: compiler-dom consumes `v-pre` and keeps it out of `node.props`, so it
  // is never classified; the fixer refuses tags that still contain it.
  if (isDirective(prop) && !isBind(prop)) {
    switch (prop.name) {
      case 'for':
        return ATTRIBUTE_GROUPS.LIST_RENDERING
      case 'if':
      case 'else-if':
      case 'else':
      case 'show':
      case 'cloak':
        return ATTRIBUTE_GROUPS.CONDITIONALS
      case 'pre':
      case 'once':
        return ATTRIBUTE_GROUPS.RENDER_MODIFIERS
      case 'model':
        return ATTRIBUTE_GROUPS.TWO_WAY_BINDING
      case 'on':
        return ATTRIBUTE_GROUPS.EVENTS
      case 'html':
      case 'text':
        return ATTRIBUTE_GROUPS.CONTENT
      case 'slot':
        return ATTRIBUTE_GROUPS.SLOT
      case 'is':
        return ATTRIBUTE_GROUPS.DEFINITION
      default:
        return ATTRIBUTE_GROUPS.OTHER_DIRECTIVES
    }
  }

  const name = isDirective(prop) ? (prop.arg?.content ?? '') : prop.name
  switch (name) {
    case 'is':
      return ATTRIBUTE_GROUPS.DEFINITION
    case 'id':
      return ATTRIBUTE_GROUPS.GLOBAL
    case 'ref':
    case 'key':
      return ATTRIBUTE_GROUPS.UNIQUE
    case 'slot':
    case 'slot-scope':
      return ATTRIBUTE_GROUPS.SLOT
    default:
      if (isDirective(prop)) {
        return ATTRIBUTE_GROUPS.ATTR_DYNAMIC
      }
      return isShorthandBoolean(prop)
        ? ATTRIBUTE_GROUPS.ATTR_SHORTHAND_BOOL
        : ATTRIBUTE_GROUPS.ATTR_STATIC
  }
}

/** Name used for alphabetical comparison within a group. */
export function attributeName(prop) {
  if (!isDirective(prop)) {
    return prop.name
  }
  if (isBind(prop)) {
    return prop.arg?.content ?? ''
  }

  let name = `v-${prop.name}`
  if (prop.arg) {
    name += `:${prop.arg.content}`
  }
  for (const modifier of prop.modifiers ?? []) {
    name += `.${modifier.content}`
  }
  return name
}

const attributePosition = (prop) =>
  GROUP_POSITIONS.get(classifyAttribute(prop)) ?? null

/**
 * `v-bind="object"` inherits the position of the next explicit binding, since
 * moving across it would change which value wins.
 */
function positionFromIndex(props, index) {
  const prop = props[index]
  if (isBindObject(prop)) {
    for (let next = index + 1; next < props.length; next++) {
      const candidate = props[next]
      if (isAttributeOrBindOrModel(candidate) && !isBindObject(candidate)) {
        return positionFromIndex(props, next)
      }
    }
  }
  return attributePosition(prop)
}

/**
 * Attributes participating in the check. `v-bind="object"` itself is skipped
 * when it sits next to an explicit binding (the pair is position-sensitive).
 */
function checkedAttributes(props) {
  const result = []

  for (let index = 0; index < props.length; index++) {
    const prop = props[index]
    if (
      isBindObject(prop) &&
      (isAttributeOrBindOrModel(props[index - 1]) ||
        isAttributeOrBindOrModel(props[index + 1]))
    ) {
      continue
    }
    const position = positionFromIndex(props, index)
    if (position === null) {
      continue
    }
    result.push({ prop, position })
  }

  return result
}

const isAlphabetical = (previous, current) => {
  const previousName = attributeName(previous)
  const currentName = attributeName(current)
  if (previousName === currentName) {
    // A plain attribute wins over a binding with the same target.
    return Number(isBind(previous)) <= Number(isBind(current))
  }
  return previousName < currentName
}

/**
 * Adjacent-pair check, mirroring the reference rule: after a violation the
 * "previous" attribute does not advance, so follow-up violations are reported
 * against the last valid attribute.
 */
export function findOrderViolations(props) {
  const attributes = checkedAttributes(props)
  if (attributes.length <= 1) {
    return []
  }

  const violations = []
  let previous = attributes[0]

  for (let index = 1; index < attributes.length; index++) {
    const current = attributes[index]
    const ordered =
      previous.position < current.position ||
      (previous.position === current.position &&
        isAlphabetical(previous.prop, current.prop))

    if (ordered) {
      previous = current
    } else {
      violations.push({ current: current.prop, previous: previous.prop })
    }
  }

  return violations
}

const compareAttributes = (left, right) => {
  const leftPosition = attributePosition(left) ?? Number.MAX_SAFE_INTEGER
  const rightPosition = attributePosition(right) ?? Number.MAX_SAFE_INTEGER
  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition
  }

  const leftName = attributeName(left)
  const rightName = attributeName(right)
  if (leftName === rightName) {
    return Number(isBind(left)) - Number(isBind(right))
  }
  return leftName < rightName ? -1 : 1
}

/** Desired order of the attributes of one element. Stable for equal keys. */
export function sortAttributes(props) {
  return [...props].sort(compareAttributes)
}

/** Targets that Vue merges regardless of order, so sorting them is safe. */
const MERGED_ATTRIBUTES = new Set(['class', 'style'])

const hasRepeatedNames = (props) => {
  const names = new Set()
  for (const prop of props) {
    const name = attributeName(prop)
    if (MERGED_ATTRIBUTES.has(name)) {
      continue
    }
    if (names.has(name)) {
      return true
    }
    names.add(name)
  }
  return false
}

/**
 * Build the source replacement that reorders the attributes of one start tag.
 *
 * Returns `{ start, end, text }` (absolute file offsets) or `null` when the tag
 * must not be rewritten: tags with `v-bind="object"` (position-sensitive),
 * repeated attribute targets, or non-whitespace between attributes (compiler-dom
 * drops `v-pre` from `props`, so rewriting around it would lose text).
 */
export function buildAttributeOrderFix(source, props, templateOffset = 0) {
  if (
    props.length <= 1 ||
    props.some(isBindObject) ||
    hasRepeatedNames(props)
  ) {
    return null
  }

  const sorted = sortAttributes(props)
  if (sorted.every((prop, index) => prop === props[index])) {
    return null
  }

  for (let index = 1; index < props.length; index++) {
    const gap = source.slice(
      templateOffset + props[index - 1].loc.end.offset,
      templateOffset + props[index].loc.start.offset,
    )
    if (!/^\s*$/.test(gap)) {
      return null
    }
  }

  const first = props[0]
  const last = props[props.length - 1]
  const start = templateOffset + first.loc.start.offset
  const end = templateOffset + last.loc.end.offset

  const gapStart = templateOffset + props[0].loc.end.offset
  const gapEnd = templateOffset + props[1].loc.start.offset
  const gap = source.slice(gapStart, gapEnd)
  const separator = gap.includes('\n')
    ? `\n${gap.slice(gap.lastIndexOf('\n') + 1)}`
    : ' '

  const text = sorted
    .map((prop) =>
      source.slice(
        templateOffset + prop.loc.start.offset,
        templateOffset + prop.loc.end.offset,
      ),
    )
    .join(separator)

  return { start, end, text }
}
