import { computed, reactive } from 'vue'
import { useField } from './useField'
import type { IFormField } from './../types/FormInit'

export const useForm = (init: IFormField[] = []) => {
  const form = reactive<any>({})

  const validKey = 'valid'

  for (const field of init) {
    form[field.name] = useField(field)
  }

  const withoutValid = (k: string) => k !== validKey

  form[validKey] = computed(() =>
    Object.keys(form)
      .filter(withoutValid)
      .every((k: string) => form[k][validKey])
  )

  return form
}
