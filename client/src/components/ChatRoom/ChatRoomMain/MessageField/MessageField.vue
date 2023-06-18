<script setup lang="ts">
import { ref, watch } from 'vue'
import styles from './MessageField.module.css'
interface Props {
  message: string
  isEdit: boolean
}

interface Emits {
  (e: 'update:message', value: string): void
  (e: 'editMessage'): void
  (e: 'sendMessage'): void
  (e: 'readMessage'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const focus = () => {
  emits('readMessage')
}

const inputHandler = () => {
  if (textarea.value?.innerText[0] === '\n') {
    textarea.value.innerText = textarea.value.innerText.trim()
  }

  emits('readMessage')
  emits('update:message', textarea.value?.innerText.trim() || '')
}

const keypressHanlder = (event: KeyboardEvent) => {
  if (event.shiftKey) return

  sendEditEmit()
}

const sendEditEmit = () => {
  props.isEdit ? emits('editMessage') : emits('sendMessage')

  if (textarea.value) textarea.value.innerText = ''
}

const textarea = ref<HTMLDivElement>()

watch(
  () => props.isEdit,
  () => {
    if (props.isEdit) {
      if (textarea.value) {
        textarea.value.innerText = props.message
      }
    }
  }
)
</script>

<template>
  <div :class="styles.wrapper">
    <div :class="styles.field">
      <div
        @focus="focus"
        :class="styles.input"
        @input="inputHandler"
        :value="props.message"
        @keypress.enter="keypressHanlder"
        contenteditable
        role="textarea"
        ref="textarea"
      ></div>
      <div :class="[styles.placeholder, { hidden: textarea?.innerText }]" ref="placeholder">
        Add a comment...
      </div>

      <span class="material-symbols-outlined" :class="styles.send" @click="sendEditEmit">
        send
      </span>
    </div>
  </div>
</template>
