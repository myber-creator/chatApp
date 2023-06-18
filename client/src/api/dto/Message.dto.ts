import type { BlockMessages, Message } from '@/types/Messages'
import type { UserChat } from '@/types/Users'

export interface MessageSendDto {
  roomId: number
  body: string
}

export interface MessageGetDto {
  idRoom: number
  message: Message
  block?: BlockMessages
}

export interface MessagesReadDto {
  id: number
  isNotRead: UserChat[]
}

export interface MessageEditDto {
  id: number
  roomId: number
  body: string
}
