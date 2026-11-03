import { computed, ref } from 'vue'

import { defineStore, acceptHMRUpdate } from 'pinia'

/**
 * Example composition store.
 *
 * Copy this file as the starting point for a real store: `defineStore` with
 * a setup function, refs for state, computed values for getters and plain
 * functions for actions. The instance lives in `src/stores/index.ts`; never
 * create a second `createPinia()` here.
 */
export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)

  // getters
  const doubleCount = computed(() => count.value * 2)

  // actions
  const increment = () => {
    count.value++
  }

  return {
    count,
    doubleCount,
    increment,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
