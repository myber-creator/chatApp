<script setup lang="ts">
import BlockMessages from './BlockMessages/BlockMessages.vue'
import type { BlockMessages as IBlockMessages } from '@/types/Messages'
import styles from './MessagesList.module.css'
import { onUpdated, onMounted, ref } from 'vue'

interface Props {
  blocks: IBlockMessages[]
}

interface Emits {
  (e: 'deleteMessage', value: number): void
  (e: 'editMessage', value: number, body: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const element = ref<HTMLDivElement>()
const scrollDown = () => {
  if (element.value) {
    element.value.scrollTop = element.value.scrollHeight + 120
  }
}

onMounted(() => {
  scrollDown()
})

onUpdated(() => {
  scrollDown()
})
</script>

<template>
  <div :class="styles.wrapper" ref="element">
    <div :class="styles.empty" v-if="!props.blocks.length">No messages yet</div>
    <BlockMessages
      v-for="block in props.blocks"
      :key="block.id"
      :block="block"
      @scroll="scrollDown()"
      @deleteMessage="(id: number) => emits('deleteMessage', id)"
      @editMessage="(id: number, body: string) => emits('editMessage', id, body)"
    />
  </div>
</template>
