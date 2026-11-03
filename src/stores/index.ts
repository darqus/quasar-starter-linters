import { defineStore } from '#q-app'
import { createPinia } from 'pinia'

/*
 * Pinia instance created by Quasar and installed before the app mounts.
 *
 * If not building with SSR mode, you can directly export the Store
 * instantiation.
 *
 * The function below can be async too; either use async/await or return a
 * Promise which resolves with the Store instance.
 */
export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})
