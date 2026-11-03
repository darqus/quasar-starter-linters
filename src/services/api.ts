import { create, type AxiosInstance } from 'axios'

/**
 * Shared HTTP client for backend requests.
 *
 * Import it where it is needed; there is no global `$api` property, because
 * the project uses `<script setup>` and explicit imports:
 *
 *   import { api } from '@/services/api'
 *   const { data } = await api.get<User[]>('/users')
 *
 * `VITE_API_URL` is documented in `.env.example` and typed in `src/env.d.ts`.
 * Without it, requests stay on the same origin, which is what a dev server
 * with a proxy or a same-origin deployment needs.
 */
export const api: AxiosInstance = create({
  baseURL: import.meta.env.VITE_API_URL ?? '/',
  headers: {
    Accept: 'application/json',
  },
})
