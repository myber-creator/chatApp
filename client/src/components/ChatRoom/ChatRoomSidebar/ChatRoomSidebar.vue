<script setup lang="ts">
import type { IRoom } from '@/types/Room'

import RoomSidebarHeader from './Header/RoomSidebarHeader.vue'
import RoomSidebarMain from './Main/RoomSidebarMain.vue'

import '@/assets/transitions.css'
import styles from './ChatRoomSidebar.module.css'

interface Props {
  room: IRoom | undefined
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="styles.sidebar">
    <RoomSidebarHeader
      :name="props.room?.name"
      :avatarPath="props.room?.avatarPath"
      :type="props.room?.type"
    />

    <RoomSidebarMain :users="props.room?.users" :type="props.room?.type" />
  </div>
</template>
