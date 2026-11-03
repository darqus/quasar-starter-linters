# quasar-starter-linters

A Quasar v3 starter whose subject is the tooling, not the demo page: a
type-aware [Oxlint](https://oxc.rs/) setup, [Oxfmt](https://oxc.rs/)
formatting, Stylelint with a BEM contract, and two project-specific guards
that close the gaps Oxlint leaves in Vue templates. Everything runs through a
single `npm run lint` and is covered by tests.

The application itself is the default Quasar starter (a layout, an example
page, a 404 page, Pinia and Axios boots). It is small on purpose: the value of
this repository is the pipeline around it.

## Requirements

- Node.js `22.22+`, `24`, `26`, `28` or `30`
- npm `6.13.4+`

## Install

```bash
npm install
```

`postinstall` runs `quasar prepare` and generates the `.quasar` TypeScript
project used by `vue-tsc` and Oxlint.

## Commands

| Command                   | What it does                                                             |
| ------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`             | Quasar dev server with HMR and `vue-tsc` checking                        |
| `npm run build`           | production SPA build                                                     |
| `npm run lint`            | Oxlint, Stylelint, Oxfmt check, Vue attribute order, no `<style>` blocks |
| `npm run fix`             | the same checks with autofix where possible                              |
| `npm run format`          | Oxfmt only                                                               |
| `npm run check:vue-attrs` | attribute order check only                                               |
| `npm run fix:vue-attrs`   | reorder template attributes automatically                                |
| `npm run typecheck`       | `vue-tsc --noEmit`                                                       |
| `npm test`                | Vitest: guard scripts and generated-token sync                           |
| `npm run build:tokens`    | regenerate `src/css/_tokens.scss` from `tokens/app.json`                 |

## Linting pipeline

| Step                | Tool                                           | Files                           | What it checks                                          |
| ------------------- | ---------------------------------------------- | ------------------------------- | ------------------------------------------------------- |
| Code correctness    | `oxlint --type-aware`                          | `src/**`, `scripts/**`, configs | correctness + suspicious categories, TypeScript rules   |
| Style correctness   | `stylelint` (`standard-scss` + `recess-order`) | `src/**/*.{css,scss,vue}`       | syntax, property order, BEM class pattern, units        |
| Formatting          | `oxfmt --check`                                | all supported files             | indentation, quotes, trailing commas, import order      |
| Template attributes | `scripts/check-vue-attribute-order.mjs`        | `src/**/*.vue`                  | `DEFINITION → … → CONTENT`, alphabetical inside a group |
| Component styles    | `scripts/check-no-style-blocks.mjs`            | `src/**/*.vue`                  | `<style>` blocks are forbidden                          |
| Types               | `vue-tsc --noEmit`                             | `src/**`                        | template and script types                               |

Type-aware rules (`no-floating-promises`, `prefer-readonly`,
`no-unnecessary-type-assertion`, …) are powered by `oxlint-tsgolint`; the
project is discovered through the root `tsconfig.json`.

### Why Oxlint instead of ESLint

- One native binary for linting and one for formatting instead of ~12
  packages of ESLint config, plugins and parser bridges.
- Type-aware rules without assembling `typescript-eslint` yourself.
- Formatting is a separate concern: no `eslint-config-prettier`, no rules
  that only exist to avoid fighting the formatter.

### Where the old ESLint rules went

Formatting rules are gone from the linter on purpose: Oxfmt owns them.

| ESLint / Prettier                                                                                                                              | Now                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `semi`, `quotes`, `indent`, `comma-dangle`, `arrow-parens`                                                                                     | Oxfmt                                                        |
| `array-bracket-spacing`, `object-curly-spacing`, `object-curly-newline`                                                                        | Oxfmt (`bracketSpacing`)                                     |
| `no-extra-semi`, `no-multiple-empty-lines`, `template-curly-spacing`                                                                           | Oxfmt                                                        |
| `import/order` + `pathGroups`                                                                                                                  | Oxfmt `sortImports` (`vue`, `quasar`/`pinia`/`#q-app`, `@/`) |
| `vue/html-indent`, `vue/max-attributes-per-line`, `vue/html-self-closing`, `vue/first-attribute-linebreak`, `vue/html-closing-bracket-newline` | Oxfmt (`singleAttributePerLine`)                             |
| `curly`, `eqeqeq`, `no-var`, `prefer-const`, `object-shorthand`                                                                                | `eslint/*` in `.oxlintrc.json`                               |
| `no-console`, `no-debugger`, `no-param-reassign`, `no-unused-expressions`                                                                      | `eslint/*` in `.oxlintrc.json`                               |
| `prefer-destructuring`, `prefer-template`, `prefer-promise-reject-errors`                                                                      | `eslint/*` in `.oxlintrc.json`                               |
| `@typescript-eslint/no-shadow`                                                                                                                 | `eslint/no-shadow`                                           |
| `@typescript-eslint/no-unused-vars`                                                                                                            | `typescript/no-unused-vars` (alias of the base rule)         |
| `consistent-type-imports`, `consistent-type-definitions`, `no-empty-interface`                                                                 | `typescript/*` in `.oxlintrc.json`                           |
| `no-explicit-any`, `ban-ts-comment`, `no-non-null-assertion`                                                                                   | `typescript/*` in `.oxlintrc.json`                           |
| `prefer-nullish-coalescing`, `prefer-optional-chain`, `prefer-readonly`                                                                        | `typescript/*` in `.oxlintrc.json`                           |
| `no-unnecessary-type-assertion`, `restrict-template-expressions`, `no-floating-promises`, `no-misused-promises`                                | `typescript/*` (type-aware)                                  |
| `vue/prop-name-casing`, `vue/require-default-prop`, `vue/require-prop-types`                                                                   | `vue/*` in `.oxlintrc.json` (script level)                   |
| `vue/attributes-order`                                                                                                                         | `scripts/check-vue-attribute-order.mjs`                      |

### What is intentionally not covered

Oxlint parses only the `<script>` block of a Vue SFC: there are no
template-level rules. That is a real gap, not an oversight, so the lost rules
are listed here explicitly.

| Lost rule                                                             | Why / replacement                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `vue/attributes-order`                                                | replaced by `scripts/check-vue-attribute-order.mjs` (same order)   |
| `vue/attribute-hyphenation`, `vue/v-on-event-hyphenation`             | no Oxlint equivalent; follow the convention in review              |
| `vue/component-name-in-template-casing`                               | no Oxlint equivalent; components are written in PascalCase by hand |
| `vue/no-v-html`, `vue/no-unused-components`, `vue/no-template-shadow` | no Oxlint equivalent                                               |
| `vue/order-in-components`, `vue/prefer-separate-static-class`         | no Oxlint equivalent; the project uses `<script setup>` anyway     |
| `vue/padding-line-between-blocks`, `vue/block-order`                  | Oxfmt keeps blocks as written; the SFC order is reviewed manually  |
| `padding-line-between-statements`, `lines-around-comment`             | Oxfmt has no equivalent; it collapses multiple blank lines to one  |
| `@typescript-eslint/naming-convention`                                | Oxlint has no equivalent                                           |
| `lines-between-class-members`                                         | Oxlint has no equivalent (the project has no classes)              |

If a template rule becomes critical for you, add a single-purpose script next
to the attribute-order guard and cover it with a Vitest test: that is the
pattern this repository demonstrates.

## Styles

The style system is documented in [`src/css/STYLE_GUIDE.md`](src/css/STYLE_GUIDE.md).
In short:

- cascade layers `reset → tokens → base → components → utilities`;
- design tokens in `tokens/app.json`, generated into `src/css/_tokens.scss`;
- BEM class names enforced by Stylelint;
- no `<style>` blocks in components;
- Quasar's unlayered CSS is only overridden in `src/css/_quasar-overrides.scss`.

The repository demonstrates the rules on real code: the 404 page and the
example component use BEM partials and tokens instead of inline styles.

## Editor setup

`.vscode/settings.json` configures Oxc as the formatter, Stylelint as the
style linter, and runs the attribute-order fixer on save. Recommended
extensions are listed in `.vscode/extensions.json`:

- `oxc.oxc-vscode` — linting, formatting, fix on save;
- `vue.volar` — Vue language support;
- `stylelint.vscode-stylelint` — style diagnostics;
- `emeraldwalk.runonsave` — the template attribute fixer.

Without the Run On Save extension the `npm run lint` gate still applies, and
`npm run fix:vue-attrs` fixes the order manually.

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Project structure

```
scripts/
├── build-tokens.mjs              # Style Dictionary → src/css/_tokens.scss
├── check-no-style-blocks.mjs     # guard: no <style> in SFCs
├── check-vue-attribute-order.mjs # guard: template attribute order
└── lib/                          # pure rule logic + Vitest tests
tokens/app.json                   # design tokens (DTCG)
src/css/                          # layered SCSS modules + STYLE_GUIDE.md
test/tokens.spec.mjs              # generated tokens stay in sync
.oxlintrc.json                    # Oxlint rules
.oxfmtrc.json                     # Oxfmt options + import groups
.stylelintrc.json                 # Stylelint + BEM contract
```

## Changelog

- 2026-11: move from ESLint + Prettier to Oxlint + Oxfmt, upgrade to Quasar v3
  (`@quasar/app-vite` 3), switch the package manager to npm, add the layered
  SCSS system with design tokens, add tests and CI.
- add Quasar, ESLint rules, Prettier config, `format.sh`, Stylelint extends.
