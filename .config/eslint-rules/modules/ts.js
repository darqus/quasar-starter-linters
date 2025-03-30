export const ts = {
  '@typescript-eslint/comma-dangle': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-shadow': [ 'error', ],
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/consistent-type-imports': 'error',

  '@typescript-eslint/no-empty-interface': [
    'error',
    {
      allowSingleExtends: true,
    },
  ],

  '@typescript-eslint/consistent-type-definitions': [ 'error', 'type', ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
}
