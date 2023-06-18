<script setup lang="ts">
import { onUpdated } from 'vue'
import { getBlocksDate } from '@/helpers/get_dates'
import type { BlockMessages } from '@/types/Messages'

import MessageItem from './Message/MessageItem.vue'

import styles from './BlockMessages.module.css'

interface Props {
  block: BlockMessages
}

interface Emits {
  (e: 'scroll'): void
  (e: 'deleteMessage', value: number): void
  (e: 'editMessage', value: number, body: string): void
}

const emits = defineEmits<Emits>()

onUpdated(() => {
  emits('scroll')
})

const props = defineProps<Props>()
</script>

<template>
  <div :class="styles.wrapper">
    <div :class="styles.date">{{ getBlocksDate(props.block.date) }}</div>
    <div :class="styles.messages">
      <MessageItem
        v-for="message in props.block.messages"
        :key="message.id"
        :message="message"
        ref="unreadBlock"
        @delete-message="(id: number) => emits('deleteMessage', id)"
        @edit-message="(id:number, body: string) => emits('editMessage', id, body)"
      />
    </div>
  </div>
</template>
