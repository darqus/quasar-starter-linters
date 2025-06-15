import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import { defineRouter, } from '#q-app/wrappers'

import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

// Create history based on environment
const createHistory = process.env.SERVER
  ? createMemoryHistory
  : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

export default defineRouter(() => createRouter({
  scrollBehavior: () => ({
    left: 0, top: 0, 
  }),
  routes,
  history: createHistory(process.env.VUE_ROUTER_BASE),
}))
