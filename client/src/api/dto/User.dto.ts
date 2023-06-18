export interface IUserDto {
  id: number
  email: string
  username: string
  avatarPath: string
}

export interface UserEditDto {
  id: number
  username: string
  avatarPath: string
}
