import type { IUserDto } from './User.dto'

export interface ISignInUpDto {
  user: IUserDto
  refreshToken: string
  accessToken: string
}
