<script setup lang="ts">
import { inject, ref } from 'vue'
import { useModal } from '@/hooks/useModal'
import type { UserChat } from '@/types/Users'
import RoomSidebarUsers from './UsersList/RoomSidebarUsers.vue'
import UsersList from '@/components/UsersList/UsersList.vue'
import styles from './RoomSidebarMain.module.css'
import { useRoomsStore } from '@/stores/rooms'
import { storeToRefs } from 'pinia'
import type { Socket } from '@/api/socket'

interface Props {
  users?: UserChat[]
  type?: string
}

const props = defineProps<Props>()

const icon = ref('expand_more')
const isOpen = ref(true)

const clickHandler = () => {
  icon.value = isOpen.value ? 'expand_less' : 'expand_more'
  isOpen.value = icon.value === 'expand_more'
}

const { isShow, onClose } = useModal()

let newUsers: number[] = []
const onChange = (type: string, id: number, state: boolean) => {
  if (!state) {
    return (newUsers = newUsers.filter((i) => i !== id))
  }

  if (type === 'radio') {
    newUsers = []
  }

  if (!newUsers.includes(id)) {
    newUsers.push(id)
  }
}

const roomStore = useRoomsStore()
const { activeRoom } = storeToRefs(roomStore)

const socket = inject('socket') as Socket
const onClick = () => {
  const roomStore = useRoomsStore()
  const { activeRoom } = storeToRefs(roomStore)

  socket.appendUsers(activeRoom.value, newUsers)
  onClose()
}
</script>

<template>
  <main :class="styles.main">
    <div :class="styles.head">
      <div :class="styles.members">
        <div :class="styles.title">Members</div>
        <span class="material-symbols-outlined" :class="styles.icon" @click="clickHandler">
          {{ icon }}
        </span>
      </div>
      <VButton v-if="props.type !== 'PRIVATE'" :class="styles.button" @click="isShow = true">
        <span class="material-symbols-outlined"> add </span>
        Add Member
      </VButton>
    </div>
    <RoomSidebarUsers :users="props.users" :isOpen="isOpen" />
    <Teleport to="#modals">
      <VModal :show="isShow" @close="onClose">
        <Suspense>
          <div :class="styles.users">
            <UsersList @change="onChange" :room="activeRoom" />
            <VButton :class="styles.button" class="mt-4" @click="onClick">Append</VButton>
          </div>
          <template #fallback>
            <div :class="styles.loader">
              <VLoader />
            </div>
          </template>
        </Suspense>
      </VModal>
    </Teleport>
  </main>
</template>
