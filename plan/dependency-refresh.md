# Dependency refresh and vulnerability audit

> **Статус: выполнено 2026-11-03.** Результат — в разделе 5.

Цель — обновить зависимости без поломки lint/typecheck/test/build и
разобраться с каждым пунктом `npm audit`.

## 1. Исходное состояние

`npm outdated`:

| Пакет         | Сейчас  | Wanted  | Latest | Решение                         |
| ------------- | ------- | ------- | ------ | ------------------------------- |
| `@types/node` | 22.20.5 | 22.20.5 | 26.6.6 | оставить 22.x под `engines`     |
| `oxfmt`       | 0.75.0  | 0.75.0  | 0.76.0 | обновить                        |
| `stylelint`   | 17.16.0 | 17.16.0 | 18.0.0 | не обновлять (peer-конфликт)    |
| `typescript`  | 5.9.3   | 5.9.3   | 7.0.2  | проверить совместимость с vue-tsc |

Остальные прямые зависимости уже последних версий: `quasar` 2.35.2,
`@quasar/app-vite` 3.10.3, `@quasar/extras` 2.1.0, `pinia` 4.1.0, `vue`
3.5.44, `vue-router` 5.4.0, `axios` 1.21.0, `vitest` 5.1.0, `oxlint` 1.90.

## 2. Уязвимости

`npm audit`: 6 записей (2 low, 4 moderate). Все — транзитивные зависимости
`style-dictionary` (dev-only, в runtime bundle не попадают).

| Пакет                             | Advisory            | Патч       | Решение                     |
| --------------------------------- | ------------------- | ---------- | --------------------------- |
| `glob`                            | GHSA-3g3m-2fjr-6pw4 | 14.0.2     | override `^14.0.3`          |
| `minimatch`                       | GHSA-g3hv-75wg-m249 | 11.0.1     | override `^11.0.4`          |
| `deepmerge`                       | GHSA-gcqx-w48m-w2h4 | нет        | принять как disputed CVE    |
| `@bundled-es-modules/glob`        | через `glob`        | —          | закроется override          |
| `@bundled-es-modules/deepmerge`   | через `deepmerge`   | —          | остаётся                    |
| `style-dictionary`                | через оба пакета    | —          | частично закроется override |

Важно: `deepmerge` advisory **оспорен** (VulnCheck отклонил
CVE-2026-93753 2026-11-02: глобальный `Object.prototype` не меняется).
Патча нет, библиотека не обновлялась с 2023 года. Заменять
Style Dictionary ради dev-only advisory нецелесообразно; фиксируем причину
в документации и ждём обновления advisory/пакета.

## 3. План работ

1. Проверить TypeScript 7 с `vue-tsc` и `oxlint --type-aware`; обновлять
   только если весь набор проверок проходит без обходных решений.
2. Обновить `oxfmt` до 0.76, прогнать форматирование.
3. Добавить npm `overrides` для `glob` и `minimatch`; проверить
   `build:tokens` и `test/tokens.spec.mjs`.
4. Не обновлять `stylelint` до 18: `stylelint-config-standard-scss@17` и
   `stylelint-config-recess-order@7.10` требуют `stylelint ^17`.
5. `@types/node` оставить на последней 22.x: типы должны соответствовать
   минимальной поддерживаемой Node, а не максимальной.
6. Прогнать `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`,
   `npm run build`, `npm audit`; обновить план разделом «Результат».

## 4. Критерии готовности

- `npm audit` не содержит реальных (не disputed) уязвимостей.
- `npm outdated` не содержит обновлений, которые безопасно применить.
- Все проверки зелёные, lock-файл консистентен.
- Причина сохранения `deepmerge` и `stylelint@17` зафиксирована.

## 5. Результат

Выполнено 2026-11-03.

### Обновления

- Добавлен CI-шаг `npm audit --omit=dev`: production-зависимости должны
  оставаться без уязвимостей.
- `oxfmt` 0.75.0 → **0.76.0**; форматирование не изменилось.
- Добавлены `overrides`: `glob ^14.0.3`, `minimatch ^11.0.4`.
- `style-dictionary` остаётся 5.7.1 (последняя версия), теперь с
  патченными транзитивными `glob`/`minimatch`.
- `stylelint` оставлен на 17.16.0: `stylelint-config-standard-scss@17.0.0`
  требует `stylelint ^17.0.0`, `stylelint-config-recess-order@7.10.0` —
  `^16.18.0 || ^17.0.0`. Обновление до 18 сломает peer-контракт.
- `typescript` оставлен на 5.9.3. Проверка TS 7.0.2:
  `vue-tsc@3.3.14` падает с `ERR_PACKAGE_PATH_NOT_EXPORTED` на
  `typescript/lib/tsc`. Обновление до TS 7 возможно только после
  совместимого `vue-tsc`.
- `@types/node` оставлен на 22.20.5 — последняя ветка 22.x, соответствующая
  минимальной поддерживаемой Node (`engines` ≥ 22.22.0).

### Аудит

| Проверка                | До                            | После                          |
| ----------------------- | ----------------------------- | ------------------------------ |
| `npm audit`             | 6 (2 low, 4 moderate)         | 3 low (`deepmerge`, disputed)  |
| `npm audit --omit=dev`  | 0                             | 0                              |
| `npm outdated`          | 4 пакета                      | 3 осознанных hold'а            |

Оставшиеся 3 записи — один и тот же `deepmerge`, подтянутый через
`@bundled-es-modules/deepmerge` и `style-dictionary`. Advisory
GHSA-gcqx-w48m-w2h4 / CVE-2026-93753 **оспорен**: VulnCheck отклонил CVE
2026-11-02, глобальный `Object.prototype` не изменяется, патча нет.
Пакет используется только при генерации токенов (`npm run build:tokens`,
`npm test`), в runtime bundle не попадает. Решение зафиксировано в README.

### Проверки

| Проверка          | Результат                          |
| ----------------- | ---------------------------------- |
| `npm ci`          | проходит, overrides применяются    |
| `npm run lint`    | 0 ошибок                           |
| `npm run typecheck` | 0 ошибок                         |
| `npm test`        | 6 файлов, 71 тест — зелёные        |
| `npm run build`   | SPA-сборка успешна                 |
| `npm run build:tokens` | `_tokens.scss` не изменился   |
| `npm audit --omit=dev` | 0 уязвимостей                 |

