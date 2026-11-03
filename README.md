# quasar-starter-linters

A Quasar v3 starter whose subject is the tooling, not the demo page: a
type-aware [Oxlint](https://oxc.rs/) setup, [Oxfmt](https://oxc.rs/)
formatting, Stylelint with a BEM contract, and three project-specific guards
that close the gaps Oxlint leaves in Vue templates. Everything runs through a
single `npm run lint` and is covered by tests.

The application itself is the default Quasar starter (a layout, an example
page, a 404 page, a Pinia store and an HTTP service). It is small on purpose:
the value of this repository is the pipeline and the folder skeleton around
it. Where a new feature goes is described in
[`ARCHITECTURE.md`](ARCHITECTURE.md).

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

| Command                       | What it does                                                      |
| ----------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                 | Quasar dev server with HMR and `vue-tsc` checking                 |
| `npm run build`               | production SPA build                                              |
| `npm run lint`                | Oxlint, Stylelint, Oxfmt check, Vue attribute order, style guards |
| `npm run fix`                 | the same checks with autofix where possible                       |
| `npm run format`              | Oxfmt only                                                        |
| `npm run check:vue-attrs`     | attribute order check only                                        |
| `npm run fix:vue-attrs`       | reorder template attributes automatically                         |
| `npm run check:inline-styles` | static `style="..."` check only                                   |
| `npm run typecheck`           | `vue-tsc --noEmit`                                                |
| `npm test`                    | Vitest: guard scripts, style contracts, generated-token sync      |
| `npm run build:tokens`        | regenerate `src/css/_tokens.scss` from `tokens/app.json`          |

## Linting pipeline

| Step                | Tool                                           | Files                           | What it checks                                          |
| ------------------- | ---------------------------------------------- | ------------------------------- | ------------------------------------------------------- |
| Code correctness    | `oxlint --type-aware`                          | `src/**`, `scripts/**`, configs | correctness + suspicious categories, TypeScript rules   |
| Style correctness   | `stylelint` (`standard-scss` + `recess-order`) | `src/**/*.{css,scss,vue}`       | syntax, property order, BEM class pattern, units        |
| Formatting          | `oxfmt --check`                                | all supported files             | indentation, quotes, trailing commas, import order      |
| Template attributes | `scripts/check-vue-attribute-order.mjs`        | `src/**/*.vue`                  | `DEFINITION → … → CONTENT`, alphabetical inside a group |
| Component styles    | `scripts/check-no-style-blocks.mjs`            | `src/**/*.vue`                  | `<style>` blocks are forbidden                          |
| Static styles       | `scripts/check-no-inline-styles.mjs`           | `src/**/*.vue`                  | static `style="..."`; `:style` is allowed               |
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
- no `<style>` blocks and no static `style="..."` in components;
- Quasar's unlayered CSS is only overridden in `src/css/_quasar-overrides.scss`.

The repository demonstrates the rules on real code: the 404 page and the
example component use BEM partials and tokens instead of inline styles.
`test/styles.spec.mjs` turns the architecture into a contract: `app.scss` may
contain only `@use`, `_reset.scss` must come first, `_quasar-overrides.scss`
last, every partial must be referenced, and every regular partial must sit
inside exactly one of `@layer base`, `@layer components` or
`@layer utilities`.

## Environment variables

Copy `.env.example` to `.env.local` (git-ignored) and adjust the values.
`VITE_API_URL` is typed in `src/env.d.ts` and consumed by
`src/services/api.ts`; without it, requests stay on the current origin.

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

`.github/workflows/ci.yml` runs on pushes and pull requests with a
read-only token and a concurrency group that cancels superseded runs:

1. `npm ci`
2. `npm audit --omit=dev`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`

The full sequence runs on Node `22.22.0` (the lower bound), `24` and `26`
(`fail-fast: false`), so the supported minimum and current LTS lines are
checked rather than only declared.

## Dependency security

`npm audit --omit=dev` is clean: the production bundle has no known
vulnerabilities. `npm audit` can still report a **low-severity** `deepmerge`
advisory pulled in by the dev-only Style Dictionary build. It is disputed
upstream (VulnCheck rejected CVE-2026-93753) and has no patched release;
`glob` and `minimatch` are pinned to their patched versions through npm
`overrides`.

## Project structure

```
scripts/
├── build-tokens.mjs              # CLI: Style Dictionary → src/css/_tokens.scss
├── check-no-style-blocks.mjs     # guard: no <style> in SFCs
├── check-no-inline-styles.mjs    # guard: no static style="..." in SFCs
├── check-vue-attribute-order.mjs # guard: template attribute order
└── lib/                          # pure rule logic + Vitest tests
tokens/app.json                   # design tokens (DTCG)
src/css/                          # layered SCSS modules + STYLE_GUIDE.md
src/services/api.ts               # typed HTTP client (VITE_API_URL)
src/types/                        # domain and shared types
src/router/names.ts               # route names (ROUTE_NAME)
test/tokens.spec.mjs              # generated tokens stay in sync
test/styles.spec.mjs              # style architecture contract
.oxlintrc.json                    # Oxlint rules
.oxfmtrc.json                     # Oxfmt options + import groups
.stylelintrc.json                 # Stylelint + BEM contract
```

The folder map, dependency direction and the recipe for a new feature live
in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## License

[MIT](LICENSE) © 2026 darqus

## Changelog

- 2026-11: architecture hardening — `src/types` and `src/services`, named
  routes, typed `VITE_*` variables, inline-style and style-contract tests, a
  shared `.vue` collector, CI matrix and `LICENSE`.
- 2026-11: move from ESLint + Prettier to Oxlint + Oxfmt, upgrade to Quasar v3
  (`@quasar/app-vite` 3), switch the package manager to npm, add the layered
  SCSS system with design tokens, add tests and CI.
- add Quasar, ESLint rules, Prettier config, `format.sh`, Stylelint extends.
