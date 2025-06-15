import js from '@eslint/js'
import pluginQuasar from '@quasar/app-vite/eslint'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginImport from 'eslint-plugin-import'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

import { rules, } from './.config/eslint-rules/index.js'

export default defineConfigWithVueTs(
  {
    ignores: [
      '**/.quasar',
      '**/dist',
      '**/node_modules',
      '**/tsconfig.json',
      '**/package.json',
      '**/yarn.lock',
      '**/quasar.testing.json',
      '**/quasar.extensions.json',
      'dist',
      'src-capacitor',
      'src-cordova',
      '.quasar',
      'node_modules',
      'quasar.config.*.temporary.compiled*',
    ],
  },

  // Apply Prettier first
  prettierSkipFormatting,

  pluginQuasar.configs.recommended(),
  js.configs.recommended,

  pluginVue.configs['flat/strongly-recommended'],

  {
    // Register the import and prettier plugins
    plugins: {
      import: pluginImport,
      prettier: pluginPrettier,
    },
  },

  // Apply overrides to TypeScript and Vue files
  {
    files: [
      '**/*.ts',
      '**/*.mts',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.vue',
    ],
    rules,
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // https://github.com/vuejs/eslint-config-typescript
  vueTsConfigs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },
  },

  {
    files: [ 'src-pwa/custom-service-worker.ts', ],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  }
)
