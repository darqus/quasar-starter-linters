// Vue-specific ESLint rules - Updated for Vue 3 and modern practices

export const vue = {
  // NAMING AND CONVENTIONS
  'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
  'vue/component-name-in-template-casing': [
    'error',
    'PascalCase',
    {
      registeredComponentsOnly: true,
      ignores: [],
    },
  ],

  // ATTRIBUTE ORGANIZATION
  'vue/no-multiple-template-root': 'off', // Vue 3 allows multiple root elements
  'vue/padding-line-between-blocks': ['error', 'always'],

  // TEMPLATE FORMATTING - Coordinated with Prettier
  'vue/html-self-closing': [
    'error',
    {
      html: { void: 'always', normal: 'always', component: 'always' },
      svg: 'always',
      math: 'always',
    },
  ],
  'vue/max-attributes-per-line': [
    'error',
    {
      singleline: 1,
      multiline: 1,
    },
  ],
  'vue/first-attribute-linebreak': [
    'error',
    {
      singleline: 'ignore',
      multiline: 'below',
    },
  ],
  'vue/html-closing-bracket-newline': [
    'error',
    {
      singleline: 'never',
      multiline: 'always',
    },
  ],
  'vue/html-indent': [
    'error',
    2,
    {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: false,
      ignores: [],
    },
  ],

  // DIRECTIVE FORMATTING (дополнительно к strongly-recommended)
  'vue/v-bind-style': ['error', 'shorthand'],
  'vue/v-on-style': ['error', 'shorthand'],

  // COMPOSITION API AND MODERN VUE 3 RULES
  'vue/require-default-prop': 'error',
  'vue/require-explicit-emits': 'error',
  'vue/no-unused-components': 'error',
  'vue/no-template-shadow': 'error',
  'vue/no-v-html': 'warn',
  'vue/prefer-separate-static-class': 'warn',

  // COMPONENT OPTIONS ORDER
  'vue/order-in-components': [
    'error',
    {
      order: [
        'el',
        'name',
        'key',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        ['components', 'directives', 'filters'],
        'extends',
        'mixins',
        ['provide', 'inject'],
        'ROUTER_GUARDS',
        'layout',
        'middleware',
        'validate',
        'scrollToTop',
        'transition',
        'loading',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'emits',
        'setup',
        'asyncData',
        'data',
        'fetch',
        'head',
        'computed',
        'watch',
        'watchQuery',
        'LIFECYCLE_HOOKS',
        'methods',
        ['template', 'render'],
        'renderError',
      ],
    },
  ],

  // TEMPLATE STRUCTURE
  'vue/block-tag-newline': [
    'error',
    {
      singleline: 'consistent',
      multiline: 'consistent',
      maxEmptyLines: 0,
    },
  ],

  // BLOCK ORDER - Enforce script → template → style order
  'vue/block-order': [
    'error',
    {
      order: ['script', 'template', 'style'],
    },
  ],

  // DISABLED RULES TO AVOID PRETTIER CONFLICTS
  'vue/script-indent': 'off', // Let Prettier handle indentation
  'vue/singleline-html-element-content-newline': 'off', // Conflicts with Prettier
  'vue/html-closing-bracket-spacing': 'off', // Let Prettier handle this
  'vue/multiline-html-element-content-newline': 'off', // Let Prettier handle this
}
