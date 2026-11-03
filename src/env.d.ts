/// <reference types="@quasar/app-vite/client" />

/**
 * Client environment variables exposed by Vite/Quasar.
 *
 * Quasar generates the base `ImportMetaEnv` interface in
 * `.quasar/quasar.d.ts`. This file stays ambient (no imports) on purpose:
 * declarations then merge with the generated interface instead of replacing
 * it. Add every `VITE_*` variable here and to `.env.example`.
 */
interface ImportMetaEnv {
  /** Backend base URL used by `src/services/api.ts`. */
  readonly VITE_API_URL?: string
}
