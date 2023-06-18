import { ref } from 'vue'

export const useUsersList = () => {
  const newUsers = ref<number[]>([])
  const onChange = (type: string, id: number, state: boolean) => {
    if (!state) {
      return (newUsers.value = newUsers.value.filter((i) => i !== id))
    }

    if (type === 'radio') {
      newUsers.value = []
    }

    if (!newUsers.value.includes(id)) {
      newUsers.value.push(id)
    }
  }

  return { newUsers, onChange }
}
