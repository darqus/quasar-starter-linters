export default {
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-prettier-scss',
    'stylelint-config-recess-order',
  ],
  overrides: [
    {
      files: [ 'src/*.scss', 'src/**/*.scss', ],
    },
  ],
  rules: {
    'declaration-empty-line-before': 'never',
    'scss/at-each-key-value-single-line': true,
    'scss/at-if-no-null': null,
    'scss/comment-no-empty': null,
    'scss/comment-no-loud': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/dollar-variable-pattern': null,
    'scss/double-slash-comment-empty-line-before': 'never',
    'scss/no-global-function-names': null,
    'scss/operator-no-unspaced': true,
    'scss/selector-nest-combinators': 'always',
    'unit-allowed-list': [
      'em',
      'rem',
      'ms',
      's',
      '%',
      'px',
      'fr',
      'vw',
      'vh',
      'deg',
    ],
  },
}
