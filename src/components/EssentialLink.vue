<script setup lang="ts">
import type { EssentialLinkProps } from '@/types/essential-link'

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
})
</script>

<template>
  <q-item
    :href="link"
    tag="a"
    target="_blank"
    clickable
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
