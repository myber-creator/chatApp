<script setup lang="ts">
import { getAnotherUsers } from '@/api/axios'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { UserChat } from '@/types/Users'
import UserItem from './UserItem/UserItem.vue'

import styles from './UsersList.module.css'

interface Props {
  type?: string
  room?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'CHANNEL'
})

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

let users: UserChat[]
if (user.value) {
  users = await getAnotherUsers(user.value.id, props.room)
}

interface Emits {
  (e: 'change', type: string, id: number, state: boolean): void
}

const emits = defineEmits<Emits>()

const onChange = (type: string, id: number, state: boolean) => {
  emits('change', type, id, state)
}
</script>

<template>
  <fieldset :class="styles.wrapper__inner">
    <UserItem
      v-for="user in users"
      :key="user.id"
      :user="user"
      :type="props.type"
      @change="onChange"
    />
  </fieldset>
</template>
