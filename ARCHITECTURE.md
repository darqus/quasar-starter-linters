# Architecture

This starter is a **skeleton for growth**, not a demo application. The demo
page exists to keep every folder honest: each layer below is either used by
the example or is a documented extension point. When you add the first real
feature, this file tells you where each file belongs and which direction the
imports may point.

## 1. Folder map

```
src/
├── App.vue              # root component: <router-view /> only
├── assets/              # static assets imported from code
├── components/          # reusable presentation components
├── composables/         # extension point: reusable stateful logic
├── css/                 # cascade layers, tokens, BEM partials
├── layouts/             # shells shared by several pages
├── pages/               # one page per route
├── router/              # routes.ts + names.ts
├── services/            # HTTP and external integrations (api.ts)
├── stores/              # Pinia stores
├── types/               # domain and shared types
├── utils/               # extension point: pure functions
└── env.d.ts             # typed VITE_* variables
```

The `composables/` and `utils/` folders are **not created yet** on purpose:
an empty folder is noise. Create them with the first composable or pure
helper, and move code there once a second consumer appears.

## 2. Dependency direction

```
pages  ──→ components, composables, router/names, services, stores, types, utils
layouts ─→ components, router/names, types
components ─→ composables, types, utils
stores ───→ services, types, utils
services ─→ types, utils
types, utils ─→ nothing from src/
```

Rules:

1. A component never imports a **page**. Pages are entry points and are
   allowed to disappear or change route.
2. Shared types come from `src/types/`; a component never exports types from
   its `<script setup>` block (`vue/no-export-in-script-setup` enforces the
   syntax part).
3. No barrel files (`index.ts` re-exports): they create cycles and pull
   unrelated modules into the bundle. Import the exact module.
4. `src/router/routes.ts` knows about pages; pages only import `ROUTE_NAME`
   from `src/router/names.ts`, never route records. Navigation uses names,
   not paths.

## 3. Where a new feature goes

Start in the common folders. Promote to a feature folder when the feature
really has its own boundaries.

1. **A new page** → `src/pages/<Name>Page.vue`, registered in
   `src/router/routes.ts` with a name from `src/router/names.ts`.
2. **A reusable block** → `src/components/<Name>.vue` plus its BEM partial
   `src/css/_<kebab-name>.scss`.
3. **Backend calls** → a function in `src/services/` (extend `api.ts` or add
   a domain service that uses it). Components do not call `axios` directly.
4. **Shared state** → `src/stores/<domain>-store.ts` as a composition store.
   The Pinia instance itself lives only in `src/stores/index.ts`.
5. **Domain types** → `src/types/<domain>.ts`. Component prop types shared by
   more than one file go there too.
6. **Runtime-only styling** → `:style` is allowed; static styling goes to the
   SCSS partial. See [the style guide](src/css/STYLE_GUIDE.md).

### When to create `src/features/<domain>/`

Create a feature folder once a domain owns **all three**: its route, at
least one component, and a store or service. Move the existing files there
and keep `pages/`, `components/` and `stores/` for cross-feature code. Do not
pre-create empty feature folders.

## 4. Boot files

`src/boot/` exists for **side effects that must run before mounting**:
registering a UI plugin, restoring a session, installing an error handler.

Not a boot file:

- an HTTP client — import `api` from `src/services/api.ts`;
- global properties — the project uses `<script setup>` and explicit imports;
- data fetching — run it from the page, store or service.

A boot file is registered in `quasar.config.ts` under `boot`. If nothing
needs one, `boot` stays an empty array.

## 5. HTTP client and environment

`src/services/api.ts` exports a typed `AxiosInstance`. `VITE_API_URL` is
declared in `src/env.d.ts` and documented in `.env.example`; without it the
client uses the current origin.

```ts
import { api } from '@/services/api'
import type { User } from '@/types/user'

const { data } = await api.get<User[]>('/users')
```

A local override goes to `.env.local` (git-ignored). Every new `VITE_*`
variable needs three changes: the type in `src/env.d.ts`, an entry in
`.env.example`, and a consumer.

## 6. Route names

`src/router/names.ts` is the single source of route identifiers:

```ts
import { ROUTE_NAME } from '@/router/names'

router.push({ name: ROUTE_NAME.HOME })
```

```vue
<q-btn :to="{ name: ROUTE_NAME.HOME }" label="Home" />
```

Paths stay in `routes.ts`; navigation never depends on them.

## 7. Verification

The architecture is protected by executable contracts, not only by review:

| Contract                                   | Enforced by                             |
| ------------------------------------------ | --------------------------------------- |
| explicit `@/` imports, no barrel cycles    | Oxlint + review                         |
| no `<style>` blocks                        | `scripts/check-no-style-blocks.mjs`     |
| no static `style="..."`                    | `scripts/check-no-inline-styles.mjs`    |
| template attribute order                   | `scripts/check-vue-attribute-order.mjs` |
| layer order, `@use`-only entry, no orphans | `test/styles.spec.mjs`                  |
| tokens in sync with `tokens/app.json`      | `test/tokens.spec.mjs`                  |
| types and templates compile                | `npm run typecheck`                     |

`npm run lint && npm run typecheck && npm test` is the local definition of
"the architecture still holds"; CI runs the same set on Node 22.22, 24 and 26.

## 8. Checklist for a new feature

1. Name the domain and decide whether it is a page or a reusable block.
2. Add types to `src/types/`.
3. Add the route name, then the route, then the page.
4. Add state to a store or data access to a service; no `axios` in the page.
5. Add the BEM partial inside `@layer components`; use tokens for values.
6. Run `npm run lint && npm run typecheck && npm test`.
7. Update this file only when the rules change — not for every feature.
