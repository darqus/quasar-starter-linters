export const common = {
  semi: [ 'error', 'never' ],
  'no-extra-semi': 'error',
  'import/order': [
    'error',
    {
      'newlines-between': 'always',
      groups: [
        'builtin',
        'external',
        'internal',
        [ 'parent', 'sibling' ],
        'index',
        'type',
        'object',
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
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '**/routes/**',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: 'api',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '**/services/api/**',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '**/stores/**',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '**/utils/**',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: 'module',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '**/components/**',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: 'components',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: 'src/**',
          group: 'internal',
        },
        {
          pattern: './**/*.scss',
          group: 'index',
          position: 'after',
        },
        {
          pattern: '../**/*.scss',
          group: 'parent',
          position: 'after',
        },
      ],
      pathGroupsExcludedImportTypes: [ 'vue' ],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      distinctGroup: true,
      warnOnUnassignedImports: true,
    },
  ],

  'import/no-unresolved': [ 'off' ],
  'comma-dangle': [
    'error',
    {
      arrays: 'only-multiline',
      objects: 'only-multiline',
      imports: 'only-multiline',
      exports: 'only-multiline',
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
        const: 2, // Changed from 3 to 2 for consistency
      },
      MemberExpression: 1,
      FunctionDeclaration: {
        body: 1,
        parameters: 2,
      },
      StaticBlock: { body: 1 },
      CallExpression: { arguments: 1 },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: true,
      offsetTernaryExpressions: true,
      ignoredNodes: [
        'TemplateLiteral',
        'ConditionalExpression > *',
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild',
      ],
    },
  ],

  // FORMATTING RULES - These work together with Prettier
  'no-console': [ 'warn', { allow: [ 'warn', 'error' ] } ],
  'arrow-parens': [ 'error', 'always' ], // Matches Prettier config
  curly: 'error',
  'object-shorthand': [ 'error', 'always' ],

  // SPACING RULES - Carefully configured to work with Prettier
  'array-bracket-spacing': [ 'error', 'always' ], // Force spaces inside brackets
  'object-curly-spacing': [
    'error',
    'always',
    {
      arraysInObjects: true,
      objectsInObjects: true,
    },
  ],

  // NEWLINE RULES - Updated to prevent conflicts
  'object-curly-newline': [
    'error',
    {
      ImportDeclaration: {
        multiline: true,
        minProperties: 6,
        consistent: true,
      },
      ExportDeclaration: {
        multiline: true,
        minProperties: 6,
        consistent: true,
      },
      ObjectExpression: {
        multiline: true,
        minProperties: 6,
        consistent: true,
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 6,
        consistent: true,
      },
    },
  ],

  // QUALITY AND SAFETY RULES
  eqeqeq: [ 'error', 'smart' ],
  'prefer-promise-reject-errors': 'error',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  'no-useless-constructor': 'off', // Disabled for TypeScript compatibility
  'no-shadow': 'off', // Use @typescript-eslint/no-shadow instead
  'no-var': [ 'error' ],
  'prefer-const': [ 'error', { destructuring: 'all' } ],
  'no-unused-expressions': [
    'error',
    { allowShortCircuit: true, allowTernary: true },
  ],
  'no-param-reassign': [ 'error', { props: false } ],

  // MODERN JS FEATURES
  'prefer-destructuring': [
    'warn',
    {
      array: false,
      object: true,
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  'prefer-template': 'warn',
  'template-curly-spacing': [ 'error', 'never' ],

  // QUOTE RULES - Must match Prettier configuration
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: true, // Allow template literals for consistency
    },
  ],

  // SPACING AND STRUCTURE RULES
  'lines-between-class-members': [ 'error', 'always' ],
  'padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      prev: '*',
      next: [ 'return', 'export', 'const', 'let' ],
    },
    {
      blankLine: 'always',
      prev: [ 'const', 'let' ],
      next: '*',
    },
    {
      blankLine: 'any',
      prev: [ 'const', 'let' ],
      next: [ 'const', 'let' ],
    },
    {
      blankLine: 'always',
      prev: [ 'case', 'default', 'directive' ],
      next: '*',
    },
    {
      blankLine: 'any',
      prev: 'directive',
      next: 'directive',
    },
  ],
  'no-multiple-empty-lines': [
    'error',
    {
      max: 1,
      maxEOF: 0,
      maxBOF: 0,
    },
  ],
  'lines-around-comment': [
    'error',
    {
      beforeBlockComment: true,
      afterBlockComment: false,
      beforeLineComment: true,
      afterLineComment: false,
      allowBlockStart: true,
      allowBlockEnd: false,
      allowObjectStart: true,
      allowObjectEnd: false,
      allowArrayStart: true,
      allowArrayEnd: false,
    },
  ],
}
