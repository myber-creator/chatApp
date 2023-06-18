<script setup lang="ts">
import { Socket } from '@/api/socket'
import { inject } from 'vue'
import type { IRoom } from '@/types/Room'
import SidebarRoom from './Room/SidebarRoom.vue'

import '@/assets/transitions.css'
import styles from './SidebarRoomList.module.css'
import { useRoute } from 'vue-router'

interface Props {
  rooms: IRoom[]
}

const props = defineProps<Props>()

const socket = inject('socket') as Socket
const route = useRoute()

const getBlocks = (room: IRoom) => {
  if (+route.params.id === room.id) return

  socket.getBlocks(room.id)
}
</script>

<template>
  <main :class="styles.main">
    <TransitionGroup name="list">
      <SidebarRoom
        v-for="room in props.rooms"
        :key="room.id"
        :room="room"
        @click="getBlocks(room)"
      />
    </TransitionGroup>
  </main>
</template>
