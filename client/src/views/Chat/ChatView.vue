<script setup lang="ts">
import { onUnmounted, provide } from 'vue'
import { Socket } from '@/api/socket'
import { useUserStore } from '@/stores/user'
import TheSidebar from '@/components/TheSidebar/TheSidebar.vue'

import '@/assets/transitions.css'
import styles from './ChatView.module.css'

const userStore = useUserStore()
const { setUser } = userStore

const socket = new Socket()
provide('socket', socket)

onUnmounted(() => {
  socket.disconnect()
  setUser(undefined)
})
</script>

<template>
  <div :class="styles.wrapper">
    <TheSidebar />
    <RouterView />
  </div>
</template>
