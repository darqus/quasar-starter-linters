// Vue-specific ESLint rules

export const vue = {
  'vue/v-on-event-hyphenation': [
    'error',
    'always',
    {
      autofix: true,
    },
  ],
  'vue/html-self-closing': [
    'error',
    {
      html: {
        void: 'any',
      },
    },
  ],
  'vue/component-name-in-template-casing': [
    'error',
    'PascalCase',
    {
      registeredComponentsOnly: true,
      ignores: [],
    },
  ],
  'vue/attributes-order': [
    'error',
    {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        [ 'UNIQUE', 'SLOT', ],
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'ATTR_DYNAMIC',
        'ATTR_STATIC',
        'ATTR_SHORTHAND_BOOL',
        'EVENTS',
        'CONTENT',
      ],

      alphabetical: true,
    },
  ],

  // Additional Vue-specific rules that supplement the strongly-recommended preset
  'vue/require-default-prop': 'error',
  'vue/no-v-html': 'warn',
  'vue/require-explicit-emits': 'error',
  'vue/script-indent': [
    'error',
    2,
    {
      baseIndent: 0,
      switchCase: 1,
      ignores: [],
    },
  ],
  'vue/no-template-shadow': 'error',
  'vue/no-unused-components': 'error',
  'vue/order-in-components': [
    'error',
    {
      order: [
        'el',
        'name',
        'key',
        'parent',
        'functional',
        [ 'delimiters', 'comments', ],
        [ 'components', 'directives', 'filters', ],
        'extends',
        'mixins',
        [ 'provide', 'inject', ],
        'ROUTER_GUARDS',
        'layout',
        'middleware',
        'validate',
        'scrollToTop',
        'transition',
        'loading',
        'inheritAttrs',
        'model',
        [ 'props', 'propsData', ],
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
        [ 'template', 'render', ],
        'renderError',
      ],
    },
  ],
  'vue/block-tag-newline': [
    'error',
    {
      singleline: 'consistent',
      multiline: 'consistent',
      maxEmptyLines: 0,
    },
  ],
}
