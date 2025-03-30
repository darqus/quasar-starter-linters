export const common = {
  semi: [ 'error', 'never', ],

  'no-extra-semi': 'error',

  'import/newline-after-import': [
    'error',
    {
      count: 2,
    },
  ],

  'import/order': [
    'error',
    {
      'newlines-between': 'always',
      groups: [
        'builtin',
        'external',
        'internal',
        [ 'sibling', 'parent', ],
        'index',
        'unknown',
      ],
      pathGroups: [
        {
          pattern: 'vue**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'pinia',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/boot/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/axios/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '#q-app',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '#q-app/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'quasar',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'quasar/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/types/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/routes/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'api',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/services/api/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/stores/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/utils/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'module',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/components/common/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: 'components',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '**/components/**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '^[./]',
          group: 'internal',
          position: 'before',
        },
      ],
      pathGroupsExcludedImportTypes: [ 'vue', ],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      distinctGroup: true,
      warnOnUnassignedImports: true,
    },
  ],

  'import/no-unresolved': 0,

  'comma-dangle': [
    'error',
    {
      arrays: 'always',
      objects: 'always',
      imports: 'always',
      exports: 'always',
      functions: 'never',
    },
  ],

  // https://eslint.org/docs/latest/rules/indent#rule-details
  indent: [
    'error',
    2,
    {
      SwitchCase: 1,
      VariableDeclarator: {
        var: 2,
        let: 2,
        const: 3,
      },
      MemberExpression: 1,
      FunctionDeclaration: {
        body: 1,
        parameters: 2,
      },
      StaticBlock: {
        body: 1,
      },
      CallExpression: {
        arguments: 1,
      },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: true,
      offsetTernaryExpressions: true,
    },
  ],

  'no-console': [
    'warn',
    {
      allow: [ 'warn', 'error', ],
    },
  ],

  'arrow-parens': [ 'error', 'always', ],
  curly: 'error',

  'object-shorthand': [ 'error', 'always', ],

  'array-bracket-spacing': [ 'error', 'always', ],

  // https://eslint.org/docs/latest/rules/object-curly-spacing
  'object-curly-spacing': [
    'error',
    'always',
    {
      arraysInObjects: true,
      objectsInObjects: true,
    },
  ],

  // https://eslint.org/docs/rules/object-curly-newline
  'object-curly-newline': [
    'error',
    {
      ImportDeclaration: {
        multiline: true,
        minProperties: 2,
      },
      ExportDeclaration: {
        multiline: true,
        minProperties: 2,
      },
      ObjectExpression: {
        multiline: true,
        minProperties: 1,
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 1,
      },
    },
  ],

  eqeqeq: [ 'error', 'smart', ],
  'prefer-promise-reject-errors': 'off',

  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: false,
    },
  ],

  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

  'no-useless-constructor': 'off',

  'no-shadow': 'off',

  'no-var': [ 'error', ],

  'lines-between-class-members': [ 'error', 'always', ],

  'padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      prev: '*',
      next: [ 'return', 'export', 'const', 'let', ],
    },
    {
      blankLine: 'always',
      prev: [ 'const', 'let', ],
      next: '*',
    },
    {
      blankLine: 'any',
      prev: [ 'const', 'let', ],
      next: [ 'const', 'let', ],
    },
    {
      blankLine: 'always',
      prev: [ 'case', 'default', 'directive', ],
      next: '*',
    },
    {
      blankLine: 'any',
      prev: 'directive',
      next: 'directive',
    },
  ],
}
