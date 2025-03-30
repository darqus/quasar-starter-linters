<script setup lang="ts">
import {
  computed, ref,
} from 'vue'

import type {
  Todo, Meta,
} from './models'


type Props = {
  title: string
  todos?: Todo[]
  meta: Meta
  active: boolean
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
})

const clickCount = ref(0)

const increment = () => {
  clickCount.value++
}

const todoCount = computed(() => props.todos.length)
</script>

<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
        @click="increment"
      >
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>
