<script setup lang="ts">
import type { FormProps } from '@/types/EditForms'
import type { IFormControl } from '@/types/FormControl'

import styles from './VForm.module.css'

type Props = {
  controls: IFormControl[]
  title?: string
  form: FormProps
  type?: string
  options?: string[]
  isLoading?: boolean
}

type Emits = {
  (e: 'update_form', key: string, val: string | number): void
  (e: 'update_loading', value: boolean): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
</script>

<script lang="ts">
export default {
  name: 'VForm'
}
</script>

<template>
  <form>
    <div :class="styles.title">{{ props.title }}</div>
    <VFormControl
      v-for="control in props.controls"
      :class="{ [styles['invalid']]: !form[control.title].valid && form[control.title].touched }"
      :key="control.title"
      :control="control"
      :value="form[control.title].value"
      @update_value="(val:string | number) => emits('update_form', control.title, val)"
      :blur="form[control.title].blur"
      @update_loading="(val: boolean) => emits('update_loading', val)"
      :isLoading="isLoading"
      :type="type"
      :options="options"
    />
    <slot name="body"></slot>

    <VButton :class="styles.button" :disabled="!form.valid || isLoading">{{ props.title }}</VButton>
    <slot></slot>
  </form>
</template>
