import type { FormField } from './FormControl'

export interface IUser {
  Email: FormField
  Password: FormField
  [key: string]: any
}

export interface INewUser extends IUser {
  Username: FormField
}

export interface UserChat {
  id: number
  avatarPath: string
  username: string
  isOnline: boolean
}
