<script setup lang="ts">
import { Socket } from '@/api/socket'
import { inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import ChatRoomMain from '@/components/ChatRoom/ChatRoomMain/ChatRoomMain.vue'
import ChatRoomSidebar from '@/components/ChatRoom/ChatRoomSidebar/ChatRoomSidebar.vue'

import styles from './ChatRoomView.module.css'
import { useRoomsStore } from '@/stores/rooms'

const route = useRoute()

const socket = inject('socket') as Socket

onMounted(() => {
  socket.getBlocks(+route.params.id)
})

const roomsStore = useRoomsStore()
const { findRoomById } = roomsStore
</script>

<template>
  <div :class="styles.wrapper">
    <ChatRoomMain :room="+route.params.id" />
    <ChatRoomSidebar :room="findRoomById(+route.params.id)" />
  </div>
</template>
