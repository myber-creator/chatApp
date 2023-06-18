<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { useForm } from '@/hooks/useForm'
import { minlength } from '@/helpers/validators'
import { useRoomsStore } from '@/stores/rooms'
import { storeToRefs } from 'pinia'
import { useModal } from '@/hooks/useModal'
import type { MenuSection } from '@/types/Menu'
import type { IFormControl } from '@/types/FormControl'
import type { Socket } from '@/api/socket'

import styles from './RoomSidebarHeader.module.css'
import { useRouter } from 'vue-router'

interface Props {
  name?: string
  avatarPath?: string
  type?: string
}

const props = defineProps<Props>()
const socket = inject('socket') as Socket
const router = useRouter()

const roomStore = useRoomsStore()
const { activeRoom } = storeToRefs(roomStore)

const color = computed(() => (props.type === 'CHANNEL' ? 'bg-violet-500' : 'bg-rose-500'))

const position = {
  right: true,
  top: true
}
const sections: MenuSection[] = [
  {
    buttons: [
      {
        text: 'Edit',
        icon: 'EditIcon',
        color: 'bg-slate-700',
        function: () => {
          isShow.value = true
        }
      }
    ]
  },
  {
    buttons: [
      {
        text: 'Sign out',
        icon: 'LogoutIcon',
        color: 'bg-rose-700',
        function: () => {
          const id = activeRoom.value
          router.push('/chat')
          socket.leaveFromRoom(id)
        }
      }
    ]
  }
]

const controls: IFormControl[] = [
  {
    title: 'Avatar',
    type: 'file'
  },
  {
    title: 'Name',
    type: 'text'
  }
]
const form = useForm([
  { name: 'Avatar', value: '' },
  {
    name: 'Name',
    value: props.name ?? '',
    validators: [{ name: 'minLength', function: minlength(4) }]
  }
])

watch(
  () => props.name,
  () => {
    form.Name.value = props.name
  }
)

const { isShow, onClose } = useModal(() => {
  form.Name.value = props.name
  form.Avatar.value = ''
})

const isLoading = ref(false)
const submit = () => {
  if (isLoading.value) return

  const dto = { id: activeRoom.value, name: form.Name.value, avatarPath: form.Avatar.value }

  socket.editRoom(dto)
  onClose()
}
</script>

<template>
  <header :class="styles.header">
    <VAvatar
      :avatarPath="props.avatarPath"
      :name="props.name"
      :color="color"
      :class="styles.avatar"
    />
    <div :class="styles.content">
      <div :class="styles.name">{{ props.name }}</div>
      <div :class="styles.menu">
        <VMenu :position="position" :sections="sections">
          <span class="material-symbols-outlined" :class="styles.icon"> more_horiz </span>
        </VMenu>
      </div>
    </div>
    <Teleport to="#modals">
      <VModal :show="isShow" @close="onClose">
        <VForm
          :controls="controls"
          :form="form"
          title="Edit"
          :class="styles.form"
          @submit.prevent="submit"
          @update_form="(key: string, val: string) => form[key].value = val"
          type="room"
          :isLoading="isLoading"
          @update_loading="(val: boolean) => (isLoading = val)"
        ></VForm>
      </VModal>
    </Teleport>
  </header>
</template>
