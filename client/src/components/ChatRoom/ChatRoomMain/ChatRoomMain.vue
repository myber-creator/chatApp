<script setup lang="ts">
import { useRoomsStore } from '@/stores/rooms'
import { inject, ref } from 'vue'

import MessageField from './MessageField/MessageField.vue'
import MessagesList from './MessagesList/MessagesList.vue'

import styles from './ChatRoomMain.module.css'
import type { Socket } from '@/api/socket'

interface Props {
  room: number
}

const props = defineProps<Props>()

const roomsStore = useRoomsStore()
const { getBlocksByRoom } = roomsStore

const socket = inject('socket') as Socket

const newMessage = ref('')
const sendMessage = () => {
  const message = newMessage.value.trim()

  if (!message) return

  newMessage.value = ''
  socket.sendMessage({
    roomId: props.room,
    body: message
  })
}

const readMessage = () => {
  socket.readMessage()
}

const deleteMessage = (id: number) => {
  socket.deleteMessage(id)
}

const editMessageHandler = (id: number, value: string) => {
  isEdit.value = true
  editedMessage.value = id
  newMessage.value = value
}

const editMessage = () => {
  const message = newMessage.value.trim()

  if (!message) return

  if (isEdit.value) {
    const id = editedMessage.value || -1

    socket.editMessage({ id, body: message, roomId: props.room })

    isEdit.value = false

    newMessage.value = ''
  }
}

const isEdit = ref(false)
const editedMessage = ref<number | null>(null)
</script>

<template>
  <main :class="styles.main">
    <div :class="styles.scroll" ref="element">
      <MessagesList
        :blocks="getBlocksByRoom(props.room)"
        @deleteMessage="deleteMessage"
        @editMessage="editMessageHandler"
      />
    </div>
    <MessageField
      v-model:message="newMessage"
      @sendMessage="sendMessage"
      @readMessage="readMessage"
      :isEdit="isEdit"
      @editMessage="editMessage"
    />
  </main>
</template>
