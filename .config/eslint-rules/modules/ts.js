export const ts = {
  '@typescript-eslint/comma-dangle': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-shadow': [ 'error' ],
  '@typescript-eslint/restrict-template-expressions': [
    'warn',
    { allowNumber: true },
  ],
  '@typescript-eslint/consistent-type-imports': 'error',

  '@typescript-eslint/no-empty-interface': [
    'error',
    { allowSingleExtends: true },
  ],

  // Updated: prefer 'type' over 'interface' for consistency
  '@typescript-eslint/consistent-type-definitions': [ 'error', 'type' ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'warn',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/ban-ts-comment': [
    'error',
    {
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      minimumDescriptionLength: 10,
    },
  ],
  '@typescript-eslint/explicit-module-boundary-types': 'off',

  // Updated: Remove interface prefix requirement since we prefer 'type'
  '@typescript-eslint/naming-convention': [
    'warn',
    {
      selector: 'typeAlias',
      format: [ 'PascalCase' ],
    },
    {
      selector: 'variable',
      format: [ 'camelCase', 'PascalCase', 'UPPER_CASE' ],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'function',
      format: [ 'camelCase', 'PascalCase' ],
    },
  ],

  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-floating-promises': 'warn',
  '@typescript-eslint/no-misused-promises': 'warn',

  // Added: Modern TypeScript rules
  '@typescript-eslint/prefer-readonly': 'warn',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
}
