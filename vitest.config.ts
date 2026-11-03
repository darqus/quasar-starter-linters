import { defineConfig } from 'vitest/config'

// The project ships checks and guards, not browser components, so the tests
// run in a plain Node environment.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.mjs', 'test/**/*.spec.mjs'],
  },
})
