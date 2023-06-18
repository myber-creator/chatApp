<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { getDates } from '@/helpers/get_dates'
import type { IRoom } from '@/types/Room'
import styles from './SidebarRoom.module.css'

interface Props {
  room: IRoom
}

const props = defineProps<Props>()

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const color = computed(() => (props.room.type === 'CHANNEL' ? 'bg-violet-500' : 'bg-rose-500'))
</script>
s
<template>
  <router-link
    :to="`/chat/${props.room.id}`"
    :class="styles.room"
    :key="props.room.id"
    :activeClass="styles.active"
  >
    <VAvatar
      :avatarPath="props.room.avatarPath"
      :name="props.room.name"
      :color="color"
      :class="styles.avatar"
    />
    <div :class="styles.info">
      <div :class="styles.name">{{ props.room.name }}</div>
      <div :class="styles.time">
        {{ getDates(props.room.updatedAt) }}
      </div>
      <div :class="styles.message">
        <div v-if="props.room.lastMessage" :class="styles.message__info">
          <div
            v-if="user?.username !== props.room.lastMessage.author.username"
            :class="styles.nickname"
          >
            {{ props.room.lastMessage.author.username }}:
          </div>
          <div :class="styles.message__body">
            {{ props.room.lastMessage?.body }}
          </div>
        </div>
        <div v-else :class="styles.empty">No messages yet</div>
      </div>
      <div :class="styles.count">
        <span :class="styles.number" v-if="props.room.countUnreadingMessage">{{
          props.room.countUnreadingMessage
        }}</span>
      </div>
    </div>
  </router-link>
</template>
