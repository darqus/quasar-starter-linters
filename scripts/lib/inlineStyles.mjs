import { NodeTypes, parse as parseTemplate } from '@vue/compiler-dom'
import { parse as parseSfc } from '@vue/compiler-sfc'

/**
 * Project rule: no static `style="..."` attributes in Vue components.
 *
 * Dynamic `:style` bindings stay allowed: they are the legitimate way to
 * express values that only exist at runtime (positions, user colors). Static
 * styling belongs to a layered SCSS partial, where tokens and BEM apply.
 */
export function findInlineStyles(source, filename = 'Component.vue') {
  const { descriptor, errors } = parseSfc(source, { filename })

  // Malformed SFCs are reported by the compiler and the editor; this guard
  // only speaks about inline styles, so it stays silent here.
  if (errors.length > 0) {
    return []
  }

  const { template } = descriptor
  if (!template || (template.lang && template.lang !== 'html')) {
    return []
  }

  const ast = parseTemplate(template.content, { comments: false })
  const baseLine = template.loc.start.line
  const violations = []

  const visit = (node) => {
    if (node.type === NodeTypes.ELEMENT) {
      for (const prop of node.props) {
        const isStaticStyle =
          prop.type === NodeTypes.ATTRIBUTE && prop.name === 'style'

        if (isStaticStyle) {
          violations.push({
            line: baseLine + prop.loc.start.line - 1,
            value: prop.value?.content ?? '',
          })
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
  return violations
}

export function formatInlineStyle(violation) {
  const value =
    violation.value.length > 40
      ? `${violation.value.slice(0, 37)}...`
      : violation.value

  return `line ${violation.line} (style="${value}")`
}
