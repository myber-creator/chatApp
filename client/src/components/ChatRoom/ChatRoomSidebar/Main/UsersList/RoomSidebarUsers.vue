<script setup lang="ts">
import type { UserChat } from '@/types/Users'

import RoomSidebarUser from './RoomSidebarUser/RoomSidebarUser.vue'

import styles from './RoomSidebarUsers.module.css'

interface Props {
  users?: UserChat[]
  isOpen: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="[styles.wrapper, props.isOpen ? '' : 'h-0']">
    <div :class="styles.list">
      <RoomSidebarUser v-for="user in props.users" :key="user.id" :user="user" />
    </div>
  </div>
</template>
