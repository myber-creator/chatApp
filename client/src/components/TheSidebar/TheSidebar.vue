<script setup lang="ts">
import { ref } from 'vue'
import { useRoomsStore } from '@/stores/rooms'
import { storeToRefs } from 'pinia'

import SidebarFooter from './Footer/SidebarFooter.vue'
import SidebarHeader from './Header/SidebarHeader.vue'
import SidebarRoomList from './Rooms/SidebarRoomList.vue'

import styles from './TheSidebar.module.css'

const roomsStore = useRoomsStore()
const { filteredRooms } = storeToRefs(roomsStore)

const searchValue = ref('')
</script>

<template>
  <div :class="styles.sidebar">
    <SidebarHeader v-model:input="searchValue" />

    <SidebarRoomList :rooms="filteredRooms(searchValue)" />

    <SidebarFooter />
  </div>
</template>
