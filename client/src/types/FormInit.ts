export interface IFormField {
  name: string
  value: string | number
  validators?: IValidator[]
}

export interface IValidator {
  name: string
  function: IValidatorFunc
}

interface IValidatorFunc {
  (val: any): boolean
}
