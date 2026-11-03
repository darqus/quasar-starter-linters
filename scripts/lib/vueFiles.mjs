import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

/** Directories that never contain project sources. */
export const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'out',
  'coverage',
  'resources',
])

/**
 * Collect `.vue` files under a file or directory, recursively.
 *
 * Shared by the template guards so ignore rules live in one place. A file
 * target is returned only when it is a `.vue` file; non-component files
 * produce an empty list. Results are sorted for stable diagnostics and tests.
 */
export async function collectVueFiles(target) {
  const info = await stat(target)

  if (info.isFile()) {
    return target.endsWith('.vue') ? [target] : []
  }

  if (!info.isDirectory()) {
    return []
  }

  const files = []
  const entries = await readdir(target, { withFileTypes: true })

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue
    }

    const full = path.join(target, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectVueFiles(full)))
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(full)
    }
  }

  return files.sort((left, right) => left.localeCompare(right))
}
