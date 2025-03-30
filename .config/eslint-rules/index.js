// Vue ESLint rules configuration
// import pluginVue from 'eslint-plugin-vue'
import { common, } from './modules/common.js'
import { ts, } from './modules/ts.js'
import { vue, } from './modules/vue.js'

// Extract the recommended Vue rules
// const vueRules = pluginVue.configs['flat/strongly-recommended'].rules

export const rules = {
  // Apply Vue recommended rules

  ...common,
  ...ts,
  ...vue,
}
