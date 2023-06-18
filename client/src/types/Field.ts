import type { IErrorValidators } from './ErrorValidators'
import type { Ref } from 'vue'

export interface IField {
  value: Ref<string | number>
  valid: Ref<boolean>
  errors: IErrorValidators
  touched: Ref<boolean>
  blur: () => void
}
