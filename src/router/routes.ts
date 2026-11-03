import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_NAME } from './names'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAME.HOME,
        component: () => import('@/pages/IndexPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: ROUTE_NAME.NOT_FOUND,
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
