import { computed, ref } from 'vue'

import { defineStore, acceptHMRUpdate, createPinia } from 'pinia'

export const pinia = createPinia()

// Example store using Composition API
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
