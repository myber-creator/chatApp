<script setup lang="ts">
import { computed } from 'vue'
import type { UserChat } from '@/types/Users'
import styles from './UserItem.module.css'

interface Props {
  user: UserChat
  type: string
}

interface Emits {
  (e: 'change', type: string, id: number, state: boolean): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const onChange = (event: Event) => {
  emits(
    'change',
    props.type === 'CHANNEL' ? 'checkbox' : 'radio',
    props.user.id,
    (event.target as HTMLInputElement).checked
  )
}

const inputType = computed(() => (props.type === 'CHANNEL' ? 'checkbox' : 'radio'))
</script>

<template>
  <label :class="styles.user">
    <input
      :type="inputType"
      :class="styles.button"
      name="user"
      ref="input"
      @change.stop="onChange"
    />
    <VAvatar
      color="bg-violet-500"
      :avatarPath="user.avatarPath"
      :name="user.username"
      :class="styles.avatar"
    />
    <div>{{ props.user.username }}</div>
  </label>
</template>
