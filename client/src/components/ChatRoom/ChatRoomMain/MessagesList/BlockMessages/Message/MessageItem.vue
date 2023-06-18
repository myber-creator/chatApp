<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoomsStore } from '@/stores/rooms'
import { getTime } from '@/helpers/get_dates'

import type { Message } from '@/types/Messages'
import type { MenuPosition } from '@/types/Menu'
import type { MenuSection } from '@/types/Menu'

import styles from './MessageItem.module.css'

interface Props {
  message: Message
}

interface Emits {
  (e: 'deleteMessage', value: number): void
  (e: 'editMessage', value: number, body: string): void
}

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const roomsStore = useRoomsStore()
const { firstUnread } = storeToRefs(roomsStore)

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const color = computed(() =>
  user.value?.username === props.message.author.username ? 'bg-sky-500' : 'bg-indigo-500'
)
const isOwner = computed(() => props.message.author.username === user.value?.username)
const isRead = computed(() => {
  if (props.message.author.username !== user.value?.username) return false

  return !props.message.isNotRead.length
})
const time = computed(() => getTime(props.message.createdAt))

const position: MenuPosition = { bottom: true, left: true }
const sections: MenuSection[] = [
  {
    buttons: [
      {
        text: 'Edit',
        function: () => emits('editMessage', props.message.id, props.message.body),
        icon: 'EditIcon',
        color: 'bg-slate-700'
      }
    ]
  },
  {
    buttons: [
      {
        text: 'Delete',
        function: () => emits('deleteMessage', props.message.id),
        icon: 'RemoveIcon',
        color: 'bg-rose-700'
      }
    ]
  }
]
</script>

<template>
  <div :class="styles.wrapper">
    <div v-if="firstUnread?.id === props.message.id" :class="styles.unread__notify">
      Unread messages
    </div>
    <div :class="styles.item">
      <VAvatar
        :color="color"
        :name="props.message.author.username"
        :avatarPath="props.message.author.avatarPath"
        :class="styles.avatar"
      />
      <div :class="styles.message">
        <div :class="[styles.username, isOwner ? 'italic' : '']">
          {{ isOwner ? 'You' : props.message.author.username }}
        </div>
        <div :class="styles.message__wrapper">
          <div
            :class="[
              styles.body,
              isOwner
                ? 'bg-violet-700'
                : props.message.isNotRead.find((u) => u.id === user?.id)
                ? 'bg-slate-600'
                : 'bg-secondary'
            ]"
          >
            <div :class="styles.text">{{ props.message.body }}</div>
            <div :class="styles.options">
              <div :class="styles.edit" v-if="props.message.isEdit">edit</div>
              <div :class="styles.time">
                {{ time }}
              </div>
              <span class="material-symbols-outlined" :class="styles.check" v-if="isRead">
                check
              </span>
            </div>
          </div>
          <VMenu
            :position="position"
            :sections="sections"
            :class="styles.menu"
            v-if="message.author.username === user?.username"
          >
            <span class="material-symbols-outlined"> more_vert </span>
          </VMenu>
        </div>
      </div>
    </div>
  </div>
</template>
