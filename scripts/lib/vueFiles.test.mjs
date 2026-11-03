import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { collectVueFiles, SKIP_DIRS } from './vueFiles.mjs'

let root

async function createFile(relativePath) {
  const file = path.join(root, relativePath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, '<template><div /></template>\n', 'utf8')
  return file
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'quasar-vue-files-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('collectVueFiles', () => {
  it('collects .vue files recursively and sorts them', async () => {
    const page = await createFile('pages/IndexPage.vue')
    const component = await createFile('components/ExampleComponent.vue')
    await createFile('components/ExampleComponent.spec.ts')

    await expect(collectVueFiles(root)).resolves.toEqual([component, page])
  })

  it('skips infrastructural directories', async () => {
    const kept = await createFile('components/Kept.vue')
    for (const dir of SKIP_DIRS) {
      await createFile(`${dir}/Ignored.vue`)
    }

    await expect(collectVueFiles(root)).resolves.toEqual([kept])
  })

  it('accepts a single file target', async () => {
    const file = await createFile('App.vue')
    const other = await createFile('main.ts')

    await expect(collectVueFiles(file)).resolves.toEqual([file])
    await expect(collectVueFiles(other)).resolves.toEqual([])
  })

  it('returns an empty list for an empty directory', async () => {
    await expect(collectVueFiles(root)).resolves.toEqual([])
  })
})
