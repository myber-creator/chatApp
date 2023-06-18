import { ref } from 'vue'

export const useModal = (callback?: Function) => {
  const isShow = ref(false)

  const onClose = () => {
    isShow.value = false

    if (callback) {
      callback()
    }
  }

  return { isShow, onClose }
}
