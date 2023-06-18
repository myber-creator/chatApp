<script setup lang="ts">
import '@/assets/transitions.css'
import styles from './VModal.module.css'

type Props = {
  show: boolean
}

type Emits = {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
</script>

<script lang="ts">
export default {
  name: 'VModal'
}
</script>

<template>
  <Transition name="fade">
    <div :class="styles.modal" v-if="props.show">
      <div :class="styles.modal__inner">
        <span class="material-symbols-outlined" :class="styles.close" @click="emits('close')">
          close
        </span>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>
