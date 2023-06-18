<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { uploadAvatar } from '@/api/avatars'
import type { IFormControl } from '@/types/FormControl'

import styles from './VFormControl.module.css'

type Props = {
  control: IFormControl
  value: string | number
  blur: () => void
  isLoading?: boolean
  type?: string
  options?: string[]
}

type Emits = {
  (e: 'update_value', value: string | number): void
  (e: 'update_loading', value: boolean): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const type = ref(props.control.type)
const visibility = computed(() => (type.value === 'password' ? 'visibility' : 'visibility_off'))

const updateType = () => {
  type.value = type.value === 'password' ? 'text' : 'password'
}

const inputFile = ref<HTMLInputElement>()

const click = () => {
  inputFile.value?.click()
}

const onDrop = async () => {
  if (inputFile.value) {
    const file = Array.from(inputFile.value.files ?? [])[0]

    emits('update_loading', true)
    const response: string = await uploadAvatar(file ?? new Blob(), props.type ?? 'room')
    emits('update_value', response)
    emits('update_loading', false)
  }
}

onUnmounted(() => {
  if (inputFile.value) inputFile.value.value = ''
})
</script>

<script lang="ts">
export default {
  name: 'VFormControl'
}
</script>

<template>
  <div>
    <div :class="styles.title">{{ props.control.title }}</div>
    <div :class="styles.wrapper">
      <div v-if="type === 'file'">
        <input
          :type="type"
          ref="inputFile"
          class="hidden"
          @change="onDrop"
          accept=".png, .jpg, .webp"
        />
        <VButton @click.prevent="click" :class="styles.upload">Upload new avatar</VButton>
      </div>
      <VSelect
        v-else-if="type === 'select'"
        :modelValue="props.value"
        :options="props.options"
        @update:modelValue="(value: string) => emits('update_value', value)"
      />
      <VInput
        v-else
        :type="type"
        :placeholder="props.control.placeholder"
        @input="emits('update_value', ($event.target as HTMLInputElement)?.value.trim())"
        :value="props.value"
        @blur="props.blur"
        :class="styles.input"
      />
      <span
        class="material-symbols-outlined"
        :class="styles.visibility"
        v-if="props.control.visibility"
        @click="updateType"
      >
        {{ visibility }}
      </span>
    </div>
  </div>
</template>
