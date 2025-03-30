<script setup lang="ts">
export type EssentialLinkProps = {
  title: string
  caption?: string
  link?: string
  icon?: string
}

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
