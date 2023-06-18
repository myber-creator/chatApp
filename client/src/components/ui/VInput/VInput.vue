<script setup lang="ts">
import styles from './VInput.module.css'

type Props = {
  value?: string | number
  type?: string
}

type Emits = {
  (e: 'update:value', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})
const emits = defineEmits<Emits>()
</script>

<script lang="ts">
export default {
  name: 'VInput'
}
</script>

<template>
  <input
    :type="props.type"
    :value="props.value"
    @input="emits('update:value', ($event.target as HTMLInputElement)?.value)"
    :class="styles.input"
  />
</template>
