<script setup lang="ts">
import { computed } from 'vue'
import styles from './VAvatar.module.css'

type Props = {
  avatarPath?: string
  color: string
  name?: string
}

const props = defineProps<Props>()

const letter = computed(() =>
  props.name
    ?.split(' ')
    .map((item, i) => {
      if (i < 2) return item[0].toUpperCase()
    })
    .join('')
)
</script>

<script lang="ts">
export default {
  name: 'VAvatar'
}
</script>

<template>
  <div class="flex shrink-0">
    <img :src="props.avatarPath" alt="" :class="styles.avatar" v-if="props.avatarPath" />
    <div v-else :class="[styles.avatarBlock, props.color]">
      {{ letter }}
    </div>
  </div>
</template>
