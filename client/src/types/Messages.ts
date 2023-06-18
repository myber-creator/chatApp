import type { IRoom } from './Room'
import type { UserChat } from './Users'

export type TupleBlock = [BlockMessages[], number, Message?]

export interface BlockMessages {
  id: number
  date: string
  messages: Message[]
  notifies: Notify[]
  room: IRoom
}

export interface Message {
  id: number
  body: string
  author: UserChat
  byUser: UserChat | null
  createdAt: string
  editedAt: string | null
  isEdit: boolean
  isNotRead: UserChat[]
  isResended: boolean
  block?: number | BlockMessages
  lastMessage?: Message
}

export interface Notify {}
