# Миграция `quasar-starter-linters`: oxc, Quasar v3, npm, модульные стили

Проект показательный и опенсорсный, поэтому цель — не «просто обновить», а
оставить после себя эталонный пример: воспроизводимый стек, честная таблица
«что покрыто / что нет», тесты на собственные проверки и документация, по
которой это можно повторить.

## 1. Аудит текущего состояния

| Область           | Сейчас                                                                                                                               | Проблема                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Пакетный менеджер | `yarn.lock`, `.npmrc` с pnpm-опциями, engines с yarn, README про yarn                                                                | три менеджера в одном проекте, `.npmrc` содержит опции чужого пакетного менеджера             |
| Quasar            | `@quasar/app-vite` 2.4.0, `quasar` 2.18.2, `@quasar/extras` 1.17, `vue-router` 4, `pinia` 3                                          | устарело на мажор; в конфиге живут `ssr`/`pwa`/`capacitor`/`electron`/`bex` для SPA           |
| Обёртки Quasar    | `#q-app/wrappers`                                                                                                                    | в v3 обёртки реэкспортируются из `#q-app`                                                     |
| Env               | `src/env.d.ts` с `process.env.SERVER`, `process.env.VUE_ROUTER_MODE`                                                                 | в v3 это `import.meta.env.QUASAR_*`, файл деклараций больше не нужен                          |
| Импорты           | неявные алиасы `components/…`, `layouts/…`, `pages/…`                                                                                | в v3 и в тестах работает только явный `@/`                                                    |
| Форматирование    | Prettier + `format.sh`, но фактически код отформатирован ESLint (`array-bracket-spacing: always`)                                    | два источника истины, скрипт обходит только часть каталогов, стиль `[ 'a' ]` не воспроизводим |
| ESLint            | flat config + `pluginQuasar`, `pluginVue`, `vueTsConfigs`, `eslint-plugin-import` + 5 модулей своих правил в `.config/eslint-rules/` | 12 пакетов + самописная конфигурация; часть правил — форматирование, дублирующее Prettier     |
| Stylelint         | 16 + `recommended-scss` + `prettier-scss` + `recess-order` + `stylelint-order`                                                       | версия ниже текущей, `prettier-scss` нужен только из-за Prettier                              |
| Проверка dev      | `vite-plugin-checker` с `eslint`                                                                                                     | после перехода на oxlint проверка eslint в dev не нужна                                       |
| Стили             | `src/css/app.scss` пустой, всё в Quasar-утилитах и инлайн-стилях (`style="font-size: 30vh"`)                                         | нет токенов, слоёв, неймспейсов; инлайн-стили не применимы к теме                             |
| Тесты / CI        | нет ни тестов, ни CI                                                                                                                 | собственные проверки (атрибуты, guard) ничем не защищены                                      |
| VSCode            | `.vscode` настроен на ESLint + Prettier, `stylelint.validate: ["scss"]`                                                              | после миграции половина настроек мертва                                                       |

## 2. Целевой стек (по образцу `quasar-starter-vite-ssr-firebase`)

**Пакеты (все — последние стабильные, проверено в registry):**

- `@quasar/app-vite` ^3.10.3, `quasar` ^2.35.2, `@quasar/extras` ^2.1.0,
  `@quasar/vite-plugin` ^2.0.2
- `vue` 3.5.44, `vue-router` ^5.4.0, `pinia` ^4.1.0, `@vue/devtools-api` ^8.2.1,
  `axios` ^1.21.0
- `oxlint` ^1.90.0 + `oxlint-tsgolint` ^7.0.2005 (type-aware),
  `oxfmt` ^0.75.0
- `stylelint` ^17.16.0 + `stylelint-config-standard-scss` ^17,
  `stylelint-config-recess-order` ^7.10, `postcss-scss`, `postcss-html`
- `style-dictionary` ^5.7.1, `vitest` ^5.1.0
- `typescript` 5.9.3 (**не** 7: у v7 нет классического Compiler API, `vue-tsc`
  на нём не работает), `vue-tsc` ^3.3.14, `vite-plugin-checker` ^0.14.5,
  `@types/node` ^26.6.6, `autoprefixer`, `postcss`

**Пакетный менеджер:** npm. `yarn.lock` удаляется, генерируется
`package-lock.json`, `.npmrc` с pnpm-опциями удаляется, engines —
`^30 || ^28 || ^26 || ^24 || ^22.22.0`.

**Пайплайн проверок:**

| Шаг               | Инструмент                                                                | Что проверяет                                          |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| JS/TS/Vue-скрипты | `oxlint --type-aware`                                                     | корректность, подозрительные места, типовые правила TS |
| Форматирование    | `oxfmt --check` (+ `sortImports`)                                         | отступы, кавычки, импорты                              |
| Стили             | `stylelint` (`standard-scss` + `recess-order`, `postcss-html` для `.vue`) | синтаксис, порядок свойств, BEM-паттерн                |
| Порядок атрибутов | `scripts/check-vue-attribute-order.mjs` (свой чекер + тесты)              | `DEFINITION → … → CONTENT`, алфавит внутри группы      |
| Стили в SFC       | `scripts/check-no-style-blocks.mjs` (свой чекер + тесты)                  | `<style>` в `.vue` запрещён                            |
| Типы              | `vue-tsc --noEmit`                                                        | типы шаблонов и скриптов                               |
| Тесты             | `vitest run`                                                              | чекеры + актуальность сгенерированных токенов          |

## 3. Куда переезжают правила ESLint

Форматтерные правила (уходят в `oxfmt`, из линтера удаляются):
`semi`, `quotes`, `indent`, `comma-dangle`, `array-bracket-spacing`,
`object-curly-spacing`, `object-curly-newline`, `arrow-parens`,
`no-extra-semi`, `no-multiple-empty-lines`, `padding-line-between-statements`,
`lines-around-comment`, `template-curly-spacing`, `vue/html-indent`,
`vue/max-attributes-per-line`, `vue/html-self-closing`,
`vue/first-attribute-linebreak`, `vue/html-closing-bracket-newline`,
`vue/block-tag-newline`, `vue/block-order`, `vue/padding-line-between-blocks`.

Смысловые правила — переносятся в `.oxlintrc.json` (`eslint/*`,
`typescript/*`) и в `sortImports`:

| ESLint                                                                                                                                                                                                                                                                                                                                                   | Замена                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `curly`, `eqeqeq`, `no-var`, `prefer-const`, `object-shorthand`                                                                                                                                                                                                                                                                                          | одноимённые `eslint/*` в oxlint                                                                                                       |
| `no-console`, `no-debugger`, `no-param-reassign`, `no-unused-expressions`                                                                                                                                                                                                                                                                                | `eslint/*` в oxlint                                                                                                                   |
| `prefer-destructuring`, `prefer-template`, `prefer-promise-reject-errors`                                                                                                                                                                                                                                                                                | `eslint/*` в oxlint                                                                                                                   |
| `@typescript-eslint/no-unused-vars`, `consistent-type-imports`, `consistent-type-definitions`, `no-explicit-any`, `no-non-null-assertion`, `no-empty-interface`, `ban-ts-comment`, `prefer-nullish-coalescing`, `prefer-optional-chain`, `no-floating-promises`, `no-misused-promises`, `restrict-template-expressions`, `no-unnecessary-type-assertion` | `typescript/*` в oxlint (часть — только с `--type-aware`)                                                                             |
| `@typescript-eslint/naming-convention`                                                                                                                                                                                                                                                                                                                   | не переносится (oxlint не умеет; фиксируем в README)                                                                                  |
| `import/order` + `pathGroups`                                                                                                                                                                                                                                                                                                                            | `sortImports` в `.oxfmtrc.json` (`customGroups`: vue/quasar, `@/`)                                                                    |
| `vue/attributes-order` (+ `attribute-hyphenation`, `prop-name-casing`)                                                                                                                                                                                                                                                                                   | `scripts/check-vue-attribute-order.mjs` (шаблоны) и `vue/prop-name-casing` (скрипты)                                                  |
| `vue/require-default-prop`, `vue/require-prop-types`, `vue/no-required-prop-with-default`, `vue/define-*`, `vue/prefer-import-from-vue`, `vue/no-reserved-*`, `vue/no-export-in-script-setup`                                                                                                                                                            | одноимённые `vue/*` в oxlint (script-level)                                                                                           |
| `vue/no-v-html`, `vue/require-explicit-emits`, `vue/no-unused-components`, `vue/no-template-shadow`, `vue/order-in-components`, `vue/component-name-in-template-casing`, `vue/v-on-event-hyphenation`, `vue/attribute-hyphenation`, `vue/prefer-separate-static-class`, `vue/no-multiple-template-root`                                                  | **не переносятся**: oxlint не линтит шаблоны, а два линтера держать не хотим. Явно перечисляем в README в разделе «Чего нет и почему» |

Проверено по исходникам oxlint (`crates/oxc_linter/src/rules.rs`): плагин
`vue` покрывает только `<script>`, шаблонных правил нет — поэтому чекер
атрибутов остаётся обязательным, а не «временным».

## 4. Система стилей

Та же, что в референсе: слои + токены + BEM + запрет `<style>`.

```
src/css/
  app.scss               # только @use
  quasar.variables.scss
  _reset.scss            # @layer reset, tokens, base, components, utilities
  _tokens.scss           # ГЕНЕРИРУЕТСЯ из tokens/app.json
  _quasar-overrides.scss # неслоёный escape hatch для .q-*
  _error-not-found.scss  # демонстрация: перенос инлайн-стилей 404
  _example-component.scss# демонстрация: BEM-блок списка
  STYLE_GUIDE.md
tokens/app.json
scripts/build-tokens.mjs
```

Демонстрация важна: в проекте уже есть инлайн-стили
(`style="font-size: 30vh"`, `style="opacity: 0.4"`) — переносим их в
`_error-not-found.scss` с токенами `--size-hero` и `--opacity-muted`.
`ExampleComponent` получает BEM-блок `example-component__todo` со списком и
токеном отступа. Так витрина показывает систему на реальном коде, а не на
пустом `app.scss`.

Правила из `STYLE_GUIDE.md` референса переносятся с поправкой на Quasar:
его CSS вне слоёв, значит `.q-*` переопределяются только в
`_quasar-overrides.scss`, а элементы с нашим layout-слоем не должны нести
`.row`/`.column` (это уже стоило одной регрессии в референсе).

## 5. План работ

### 5.1 Пакеты и менеджер

1. Удалить `yarn.lock`, `.npmrc`; добавить `package-lock.json` (`npm install`).
2. Обновить `dependencies`/`devDependencies` (см. §2), удалить
   `@eslint/js`, `eslint`, `eslint-plugin-*`, `prettier`,
   `@vue/eslint-config-*`, `globals`, `vue-eslint-parser`,
   `stylelint-config-prettier-scss`, `stylelint-config-recommended-scss`,
   `stylelint-order`.
3. `engines`: node `^30 || ^28 || ^26 || ^24 || ^22.22.0`, `npm >= 6.13.4`
   (yarn убрать).
4. Скрипты: `dev`, `build`, `postinstall`, `lint`, `fix`, `format`,
   `typecheck`, `test`, `test:watch`, `check:vue-attrs`, `fix:vue-attrs`,
   `build:tokens`. `format.sh` удалить.

### 5.2 Quasar v3

1. `quasar.config.ts`: `defineConfig` из `#q-app`, `build.target.node:
   'node22'`, `clientPrefix: 'VITE_'`, `vitePlugins` — только
   `vite-plugin-checker` с `vueTsc`; удалить блоки `ssr`, `pwa`,
   `capacitor`, `electron`, `bex` и мёртвые комментарии.
2. `defineBoot`/`defineRouter`/`defineStore` из `#q-app`.
3. `src/router/index.ts`: `import.meta.env.QUASAR_SERVER`,
   `QUASAR_VUE_ROUTER_MODE`, `QUASAR_VUE_ROUTER_BASE`; удалить `src/env.d.ts`.
4. Импорты: `components/…`, `layouts/…`, `pages/…` → `@/…` (7 файлов).
5. Убрать `eslint-disable`-комментарии в `src/boot/axios.ts` и
   `src/stores/index.ts`.
6. `extras`: `roboto-font` + `material-icons` (extras v2 меняет пути CSS —
   проверить, что глифы иконочного шрифта рендерятся, и что ни одно правило
   не перебивает `font-family` у лигатур).

### 5.3 Линтеры

1. `.oxlintrc.json`: категории `correctness: error`, `suspicious: warn`,
   правила из §3, `overrides` для `scripts/**` (`no-console` off),
   `ignorePatterns`.
2. `.oxfmtrc.json`: перенос опций Prettier (`semi: false`, `singleQuote`,
   `tabWidth: 2`, `printWidth: 80`, `trailingComma: "all"`,
   `singleAttributePerLine: true`, SCSS — двойные кавычки) +
   `sortImports` с группами `vue`, `quasar/pinia`, `@/`.
   **Важно:** `array-bracket-spacing: always` из ESLint уходит — весь код
   переформатируется в `['a']`, это большой, но ожидаемый дифф.
3. `.stylelintrc.json`: `standard-scss` + `recess-order`, `postcss-html`
   для `.vue`, `selector-class-pattern` под BEM, `unit-allowed-list`,
   `ignoreFiles: src/css/_tokens.scss`.
4. `scripts/check-vue-attribute-order.mjs` + `scripts/lib/vueAttributeOrder.mjs`
   - тесты (перенос из референса, 322 + 219 строк).
5. `scripts/check-no-style-blocks.mjs` + `scripts/lib/noStyleBlocks.mjs` +
   тесты.
6. `vitest.config.ts`: `include: ['test/**/*.spec.ts', 'scripts/**/*.test.mjs']`,
   окружение `node` (тесты чекеров не нуждаются в DOM — меньше зависимостей).
7. Удалить `eslint.config.js`, `.config/eslint-rules/**`, `.prettierrc.json`,
   `format.sh`.
8. Добавить тест синхронности токенов: `_tokens.scss` содержит каждый токен
   из `tokens/app.json` (падает, если забыли `npm run build:tokens`).

### 5.4 Стили

1. `tokens/app.json` (space, size.hero, opacity.muted), генератор,
   `npm run build:tokens`.
2. `_reset.scss` со стейтментом слоёв, `_tokens.scss`,
   `_quasar-overrides.scss`, `app.scss` с `@use`.
3. `_error-not-found.scss` и `_example-component.scss` (BEM), правки
   шаблонов — без изменения внешнего вида.
4. `src/css/STYLE_GUIDE.md`.

### 5.5 VS Code и документация

1. `.vscode/settings.json`: `oxc.oxc-vscode` как форматтер,
   `source.fixAll.oxc`, `source.fixAll.stylelint`, `stylelint.validate:
   ["css", "scss", "vue"]`, `npm.packageManager: "npm"`, Run On Save для
   чекера атрибутов; удалить все `eslint.*`/`prettier`-настройки.
2. `.vscode/extensions.json`: добавить `oxc.oxc-vscode`, убрать
   `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`.
3. `README.md` (английский, проект опенсорсный): установка, команды,
   раздел «Linting pipeline» с таблицей из §3, раздел «Чего нет и почему»,
   раздел «Styles» со ссылкой на `STYLE_GUIDE.md`, changelog-запись.
4. `plan/` с этим файлом (раздел «Результат» после реализации).

## 6. Проверки и критерии готовности

| Проверка                                                                                         | Ожидание                                       |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `npm run lint`                                                                                   | 0 ошибок (oxlint + stylelint + oxfmt + чекеры) |
| `npm run typecheck`                                                                              | 0 ошибок                                       |
| `npm test`                                                                                       | чекеры + синхронность токенов зелёные          |
| `npx quasar build`                                                                               | успешная SPA-сборка                            |
| `npx quasar dev` + headless Chrome                                                               | страница рендерится, иконки — глифы, не текст  |
| скриншот до/после                                                                                | внешний вид демо-страницы не изменился         |
| `grep -rn "<style" src --include=*.vue`                                                          | пусто                                          |
| `grep -rn "eslint\|prettier" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist` | только упоминания в README/плане               |
| `npm ci` с нуля                                                                                  | установка и `postinstall` проходят             |

## 7. Риски

- **Массовый реформат** из-за ухода `array-bracket-spacing` — отдельный
  коммит `style: reformat with oxfmt`, чтобы диффы читались.
- **vue-router 5 / pinia 4** — мажорные версии; проверяем `createRouter`
  и `defineStore`/`acceptHMRUpdate` в сборке и в браузере.
- **extras v2**: новые пути CSS и шрифтов; риск той же регрессии с иконками
  (универсальный `font-family`), проверяем computed style лигатуры.
- **Удалённые vue-правила** (`no-v-html` и др.) — осознанная потеря;
  фиксируем в README, чтобы это не было сюрпризом для пользователей
  стартера.
- **Отсутствие DOM-тестов** — сознательно: витрина про линтеры, а не про
  компонентное тестирование; при необходимости добавляется отдельно.

## 8. Открытые вопросы — решения

Все четыре приняты в рекомендуемом варианте:

1. **Импорты:** `components/…`, `layouts/…`, `pages/…` переведены на `@/…`.
2. **Демо-стили:** добавлены `_error-not-found.scss` и
   `_example-component.scss`; инлайн-стили из шаблонов удалены.
3. **Язык документации:** `README.md` и `src/css/STYLE_GUIDE.md` — английский,
   план остаётся русским.
4. **CI:** добавлен `.github/workflows/ci.yml`.

## 9. Результат

Всё из §5 выполнено; ниже — что именно получилось и чем это проверено.

### Пакеты и менеджер

- `yarn.lock`, `.npmrc` с pnpm-опциями и `format.sh` удалены; добавлен
  `package-lock.json`.
- Установлены: `@quasar/app-vite` 3.10.3, `quasar` 2.35.2,
  `@quasar/extras` 2.1.0, `vue` 3.5.44, `vue-router` 5.4.0, `pinia` 4.1.0,
  `axios` 1.21.0.
- Dev-стек: `oxlint` 1.90 + `oxlint-tsgolint` 7.0.2005, `oxfmt` 0.75,
  `stylelint` 17.16 + `standard-scss`/`recess-order`, `style-dictionary` 5.7.1,
  `vitest` 5.1, `typescript` 5.9.3, `vue-tsc` 3.3.14.
- `@vue/compiler-dom` и `@vue/compiler-sfc` добавлены явными devDependencies:
  чекер атрибутов не должен полагаться на транзитивные зависимости.
- `engines`: node `^30 || ^28 || ^26 || ^24 || ^22.22.0`, npm `>= 6.13.4`.

### Quasar v3

- `quasar.config.ts`: `defineConfig` из `#q-app`, `clientPrefix: 'VITE_'`,
  `target.node: 'node22'`, `vitePlugins` — только `vite-plugin-checker`
  (`vueTsc`), блоки `ssr`/`pwa`/`capacitor`/`electron`/`bex` удалены.
- `defineBoot`/`defineRouter`/`defineStore` импортируются из `#q-app`.
- `src/router/index.ts` использует `import.meta.env.QUASAR_SERVER`,
  `QUASAR_VUE_ROUTER_MODE`, `QUASAR_VUE_ROUTER_BASE`; `src/env.d.ts` удалён.
- Импорты переведены на `@/…`, `eslint-disable`-комментарии убраны.

### Линтеры

- `.oxlintrc.json`, `.oxfmtrc.json`, `.stylelintrc.json` добавлены;
  `eslint.config.js`, `.config/eslint-rules/**`, `.prettierrc.json` удалены.
- Перенесены guard-скрипты и их тесты. Итого тестов: 51 (3 файла).
- `vitest.config.ts` работает в `node`-окружении; добавлен тест
  `test/tokens.spec.mjs` на синхронность `_tokens.scss` и `tokens/app.json`.

Уточнения, найденные при переносе правил (важно для README):

- oxlint **не поддерживает** `typescript/no-shadow`; вместо него включён
  базовый `eslint/no-shadow`.
- `typescript/no-unused-vars` — алиас базового `no-unused-vars`, работает.
- `@quasar/app-vite/eslint` в v3 — это только список ignore-путей, ни одного
  правила; терять из него нечего.
- Без замены остались: `padding-line-between-statements`,
  `lines-around-comment`, `lines-between-class-members`,
  `@typescript-eslint/naming-convention` и шаблонные `vue/*`. Все они
  перечислены в README в разделе «What is intentionally not covered».

### Стили

- `tokens/app.json` (`size.hero` = 30vh, `opacity.muted` = 0.4,
  `duration.fast` = 200ms) → `src/css/_tokens.scss`.
- Слои `reset → tokens → base → components → utilities` объявлены в
  `_reset.scss`; `app.scss` содержит только `@use`.
- `_error-not-found.scss` заменил инлайн-стили `font-size: 30vh` и
  `opacity: 0.4`.
- `_example-component.scss` показывает BEM-блок и токен `--duration-fast`
  (курсор и hover-цвет списка).
- `_quasar-overrides.scss` — единственный неслоёный файл, пустой по делу.
- `src/css/STYLE_GUIDE.md` переведён на английский и дополнен разделом про
  смешивание с layout-утилитами Quasar.

### VS Code, документация, CI

- `.vscode`: форматтер `oxc.oxc-vscode`, `source.fixAll.oxc` и
  `source.fixAll.stylelint`, Run On Save для чекера атрибутов; ESLint/Prettier
  удалены из рекомендаций.
- README переписан: команды npm, таблица пайплайна, карта «ESLint → Oxlint»,
  честный список непокрытых правил, стили, CI, changelog.
- `.github/workflows/ci.yml`: `npm ci` → `lint` → `typecheck` → `test` → `build`
  на Node 24.

### Проверки

| Проверка                                   | Результат                                  |
| ------------------------------------------ | ------------------------------------------ |
| `npm run lint`                             | ✅ 0 ошибок и предупреждений               |
| `npm run typecheck`                        | ✅ 0                                       |
| `npm test`                                 | ✅ 3 файла / 51 тест                       |
| `npx quasar build`                         | ✅ SPA-сборка успешна                      |
| `quasar dev` + headless Chrome             | ✅ главная и 404 отрендерены               |
| иконки                                     | ✅ `font-family: "Material Icons"`, лигатуры |
| инлайн-стили в шаблонах                    | ✅ нет (`[style]` не найден)               |
| 404: размер/прозрачность                   | ✅ `30vh` (от viewport), `opacity: 0.4`    |
| `grep -rn "<style" src --include=*.vue`    | ✅ пусто                                   |
| `npm ci` с нуля                            | ✅ установка и `postinstall` проходят      |

### Что осталось за рамками

- Компонентных DOM-тестов нет: витрина про линтеры, а не про тестирование
  компонентов. Для чекеров тесты есть.
- Правило `vue/attributes-order` живёт в собственном скрипте, потому что
  oxlint не разбирает шаблоны; это зафиксировано и в README, и в
  `STYLE_GUIDE.md`.
