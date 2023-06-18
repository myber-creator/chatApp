import type { Message } from './Messages'
import type { UserChat } from './Users'

export interface IRoom {
  id: number
  name: string
  avatarPath: string
  type: string
  countUnreadingMessage: number
  lastMessage?: Message
  createdAt: string
  updatedAt: string
  users: UserChat[]
}
