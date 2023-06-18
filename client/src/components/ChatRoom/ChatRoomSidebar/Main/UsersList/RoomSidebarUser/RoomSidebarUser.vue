<script setup lang="ts">
import type { UserChat } from '@/types/Users'
import styles from './RoomSidebarUser.module.css'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

interface Props {
  user: UserChat
}

const props = defineProps<Props>()

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const isOwner = computed(() => props.user.username === user.value?.username)
const color = computed(() => (isOwner.value ? 'bg-sky-500' : 'bg-indigo-500'))
</script>

<template>
  <div :class="styles.user">
    <div :class="styles.avatar">
      <VAvatar
        :avatarPath="props.user.avatarPath"
        :color="color"
        :name="props.user.username"
        :class="styles.avatar__img"
      />
      <Transition name="fade">
        <div :class="styles.online" v-if="props.user.isOnline"></div>
      </Transition>
    </div>
    <div :class="[styles.username, isOwner ? 'italic' : '']">
      {{ isOwner ? 'You' : props.user.username }}
    </div>
  </div>
</template>
