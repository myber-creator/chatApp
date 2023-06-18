<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { inject, watch } from 'vue'
import { useModal } from '@/hooks/useModal'
import { minlength } from '@/helpers/validators'
import { useForm } from '@/hooks/useForm'
import type { MenuSection } from '@/types/Menu'
import type { IFormControl } from '@/types/FormControl'
import type { UserEditDto } from '@/api/dto/User.dto'
import type { Socket } from '@/api/socket'
import styles from './SidebarFooter.module.css'

const userStore = useUserStore()
const { logout } = userStore
const { user } = storeToRefs(userStore)

const router = useRouter()

const sections: MenuSection[] = [
  {
    buttons: [
      {
        icon: 'EditIcon',
        color: 'bg-slate-700',
        text: 'Edit',
        function: () => {
          isShow.value = true
        }
      }
    ]
  },
  {
    buttons: [
      {
        icon: 'LogoutIcon',
        color: 'bg-rose-700',
        text: 'Sign out',
        function: async () => {
          await logout()
          router.push('/signin')
        }
      }
    ]
  }
]

const position = {
  right: true,
  bottom: true
}

const { isShow, onClose } = useModal(() => {
  form.Username.value = user.value?.username
  form.Avatar.value = ''
})

const controls: IFormControl[] = [
  {
    title: 'Avatar',
    type: 'file'
  },
  {
    title: 'Username',
    type: 'text'
  }
]

watch(
  () => user.value?.username,
  () => {
    form.Username.value = user.value?.username
  }
)

const form = useForm([
  { name: 'Avatar', value: '' },
  {
    name: 'Username',
    value: user.value?.username ?? '',
    validators: [{ name: 'minLength', function: minlength(4) }]
  }
])

const socket = inject('socket') as Socket
const submit = () => {
  if (!user.value) return

  const dto: UserEditDto = {
    id: user.value.id,
    username: form.Username.value,
    avatarPath: form.Avatar.value
  }

  socket.editUser(dto)
  onClose()
}
</script>

<template>
  <footer :class="styles.footer">
    <div :class="styles.user">
      <VAvatar
        color="bg-sky-500"
        :name="user?.username"
        :avatarPath="user?.avatarPath"
        :class="styles.avatar"
      />
      <div :class="styles.nickname">
        <div>
          {{ user?.username }}
        </div>
        <div>
          {{ user?.email }}
        </div>
      </div>
    </div>
    <div :class="styles.settings">
      <VMenu :sections="sections" :position="position">
        <SettingsIcon />
      </VMenu>
    </div>
    <Teleport to="#modals">
      <VModal :show="isShow" @close="onClose">
        <VForm
          :controls="controls"
          :form="form"
          title="Edit"
          :class="styles.form"
          @submit.prevent="submit"
          @update_form="(key: string, val: string | number) => form[key].value = val"
          type="avatar"
        ></VForm>
      </VModal>
    </Teleport>
  </footer>
</template>
