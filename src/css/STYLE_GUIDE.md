# Style guide

Application styles live in SCSS modules under `src/css/`. Vue components
must not contain `<style>` blocks: `node scripts/check-no-style-blocks.mjs`
enforces that and is part of `npm run lint`.

## 1. Principles

1. One component — one partial `_<component>.scss` in `src/css/`.
2. Every partial lives entirely inside one cascade layer (`@layer`).
3. Numbers come from tokens (`var(--duration-fast)`), never hardcoded.
4. Class names are BEM: `block__element--modifier`, no `!important`.
5. The entry point `app.scss` contains only `@use` — not a single rule.

## 2. Cascade layers

The order is declared once in `_reset.scss`, which is the first loaded
partial:

```
reset → tokens → base → components → utilities
```

A later layer beats an earlier one **regardless of selector specificity**.

| Layer        | Contents                                              | Files                              |
| ------------ | ----------------------------------------------------- | ---------------------------------- |
| `reset`      | normalization (`box-sizing`, `html/body`, scrollbars) | `_reset.scss`                      |
| `tokens`     | CSS custom properties from `tokens/app.json`          | `_tokens.scss` (generated)         |
| `base`       | app shell element defaults                            | `_base.scss` (not needed yet)      |
| `components` | all BEM components                                    | every other partial                |
| `utilities`  | opt-in single-purpose classes (`.u-*`)                | `_utilities.scss` (not needed yet) |

### Why Quasar is an exception

Quasar loads its stylesheet **unlayered** (in `client-entry.js`, before
`app.scss`), and unlayered CSS beats any layer by specification. Therefore:

- rules inside our layers **cannot** override `.q-btn`, `.q-card`,
  `.q-field` and other Quasar classes;
- changes to Quasar components go only into `_quasar-overrides.scss` — the
  single unlayered file, loaded last;
- everything else stays layered; a rule outside a layer breaks the
  architecture.

### Do not mix with Quasar layout utilities

An element whose `display` (`grid`/`flex`) is defined by one of our modules
**must not** carry Quasar's `.row`/`.column` classes: they are unlayered and
beat our layer, silently turning the container into a flex row. Space such
grids with `gap`, not `q-gutter-*`.

```vue
<!-- wrong: .row beats `display: grid` from the layer -->
<div class="row q-gutter-md user-card-list">

<!-- right -->
<div class="user-card-list">
```

## 3. Design tokens

The single source of values is `tokens/app.json` (DTCG format):

```json
{
  "duration": {
    "fast": { "value": "200ms", "description": "Hover and focus transitions" }
  }
}
```

Generation:

```bash
npm run build:tokens   # node scripts/build-tokens.mjs (Style Dictionary)
```

The result is `src/css/_tokens.scss` (the `tokens` layer, `:root`). The file
is committed and **never edited by hand**; `stylelint` and `oxfmt` ignore it.
`test/tokens.spec.mjs` fails when the generated file is out of sync with the
JSON, so a forgotten `npm run build:tokens` is caught by `npm test`.

Rules:

1. No dead tokens: a new token appears together with its first consumer.
2. Colors come from Quasar variables (`var(--q-primary)`, `var(--q-dark)`,
   …); branding changes in `quasar.variables.scss`.
3. Arithmetic goes through `calc()`: `calc(var(--space-sm) * 2)`.
4. Quasar typography sets the `body` font, so do not duplicate it. Never
   apply a universal `font-family` rule: it breaks the ligature font of
   Material Icons.

## 4. BEM and namespaces

Styles are global (no `scoped`), so the class name _is_ the namespace:

```scss
@layer components {
  .base-form__actions {
    display: flex;
    gap: var(--space-sm);

    &--left {
      justify-content: flex-start;
    }
  }
}
```

The class pattern is enforced by stylelint:

```json
"selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$"
```

Bare names such as `.form-actions` or `.users-list` are rejected: they leak
across the whole application.

## 5. Files

```
src/css/
├── app.scss               # entry: only @use, layer order lives in ./reset
├── quasar.variables.scss  # Quasar branding (SCSS variables, not CSS)
├── _reset.scss            # layer-order statement + normalization
├── _tokens.scss           # GENERATED from tokens/app.json
├── _quasar-overrides.scss # unlayered escape hatch for .q-*
├── _error-not-found.scss  # BEM partial of ErrorNotFound.vue
├── _example-component.scss# BEM partial of ExampleComponent.vue
└── _<component>.scss      # BEM partial of a component
```

- A partial is named after the component in kebab-case:
  `BaseForm.vue` → `_base-form.scss`.
- Imports use `@use './name';` only (`@import` is deprecated).
- Static assets: paths relative to the file (`../assets/svg/x.svg`).
  Absolute and `~` paths are not used.

## 6. Guards and linting

| Tool                                   | What it checks                             |
| -------------------------------------- | ------------------------------------------ |
| `stylelint` (`standard-scss` + recess) | property order, BEM pattern, syntax errors |
| `oxfmt`                                | SCSS formatting (2 spaces, double quotes)  |
| `check-no-style-blocks.mjs`            | absence of `<style>` in `src/**/*.vue`     |
| `check-vue-attribute-order.mjs`        | attribute order in Vue templates           |

`npm run lint` runs everything, `npm run fix` applies autofixes. The guard
scripts have unit tests in `scripts/lib/*.test.mjs`.

## 7. Checklist for a new component

1. Partial `src/css/_<component>.scss`, all content inside `@layer components`.
2. Values are tokens; a non-token value becomes a token in `tokens/app.json`
   plus `npm run build:tokens`.
3. BEM classes in the template, no `<style>`.
4. Colors use `var(--q-*)`; derived shades use `color-mix()`.
5. `npm run build:tokens && npm run lint && npm run typecheck && npm test`.
