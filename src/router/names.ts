/**
 * Route names: the stable part of navigation.
 *
 * Use `router.push({ name: ROUTE_NAME.HOME })` and `:to="{ name: ... }"`
 * instead of hardcoded paths, so a URL change stays inside `routes.ts`.
 */
export const ROUTE_NAME = {
  HOME: 'home',
  NOT_FOUND: 'not-found',
} as const
