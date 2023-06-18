import type { IField } from '@/types/Field'
import type { IErrorValidators } from './../types/ErrorValidators'
import type { IFormField } from '@/types/FormInit'
import { reactive, ref, watch } from 'vue'

const not = (val: boolean) => !val

export const useField = (field: IFormField): IField => {
  const valid = ref(true)
  const value = ref(field.value)
  const touched = ref(false)
  const errors = reactive<IErrorValidators>({})

  const reassign = (val: string | number) => {
    valid.value = true

    for (const validator of field.validators || []) {
      const isValid = validator.function(val)

      errors[validator.name] = not(isValid)

      if (not(isValid)) {
        valid.value = false
      }
    }
  }

  watch(value, reassign)
  reassign(field.value)

  return { value, valid, errors, touched, blur: () => (touched.value = true) }
}
