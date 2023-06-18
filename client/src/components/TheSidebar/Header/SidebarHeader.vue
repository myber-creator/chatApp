<script setup lang="ts">
import { useModal } from '@/hooks/useModal'
import { useForm } from '@/hooks/useForm'
import { useUsersList } from '@/hooks/useUsersList'
import { inject } from 'vue'
import type { IFormControl } from '@/types/FormControl'
import type { RoomCreateDto } from '@/api/dto/Room'
import type { Socket } from '@/api/socket'
import UsersList from '@/components/UsersList/UsersList.vue'
import styles from './SidebarHeader.module.css'

interface Props {
  input: string
}

interface Emits {
  (e: 'update:input', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const controls: IFormControl[] = [
  {
    type: 'text',
    title: 'Name'
  },
  {
    type: 'select',
    title: 'Type'
  }
]

const options: string[] = ['CHANNEL', 'PRIVATE']

const form = useForm([
  {
    name: 'Name',
    value: ''
  },
  {
    name: 'Type',
    value: options[0]
  }
])

const { isShow, onClose } = useModal(() => {
  form.Type.value = 'CHANNEL'
  form.Name.value = ''
})

const socket = inject('socket') as Socket

const { newUsers, onChange } = useUsersList()
const submit = () => {
  if (!newUsers.value.length) return

  const dto: RoomCreateDto = {
    name: form.Name.value,
    users: newUsers.value,
    type: form.Type.value
  }
  socket.createRoom(dto)
  onClose()
}
</script>

<template>
  <header :class="styles.header">
    <div :class="styles.title">Messages</div>

    <div :class="styles.search">
      <SearchIcon />
      <VInput
        :class="styles.input"
        placeholder="Search..."
        :value="props.input"
        @input="emits('update:input', ($event.target as HTMLInputElement)?.value)"
      />
    </div>

    <VButton :class="styles.button" @click="isShow = true">create</VButton>

    <Teleport to="#modals">
      <VModal :show="isShow" @close="onClose">
        <VForm
          :controls="controls"
          :form="form"
          :options="options"
          title="Create"
          :class="styles.form"
          @submit.prevent="submit"
          @update_form="(key: string, val: string) => form[key].value = val"
        >
          <template v-slot:body>
            <Suspense>
              <UsersList
                @change="onChange"
                :class="styles.users"
                :type="form.Type.value"
              ></UsersList>
              <template #fallback>
                <div class="flex items-center justify-center">
                  <VLoader />
                </div>
              </template>
            </Suspense>
          </template>
        </VForm>
      </VModal>
    </Teleport>
  </header>
</template>
