import type { IErrorValidators } from './ErrorValidators'

export interface IFormControl {
  placeholder?: string
  title: string
  type?: string
  visibility?: boolean
  function?: Function
}

export interface FormField {
  value: string
  valid: boolean
  errors?: IErrorValidators
}
