import type { MessageGetDto } from '@/api/dto/Message.dto'
import type { BlockMessages, Message, TupleBlock } from '@/types/Messages'
import type { IRoom } from '@/types/Room'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useUserStore } from './user'
import type { UserChat } from '@/types/Users'
import type { IUserDto } from '@/api/dto/User.dto'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<IRoom[]>([])
  const blocks = ref<TupleBlock>([[], 0])
  const activeRoom = ref(0)

  const setRooms = (rms: IRoom[]) => {
    rooms.value = rms
  }

  const setActiveRoom = (id: number) => {
    activeRoom.value = id
  }

  const filteredRooms = computed(() => {
    return (searchValue: string): IRoom[] =>
      rooms.value.filter((room) => room.name.includes(searchValue))
  })

  const getRoomById = computed(() => {
    return (id: number): IRoom | undefined => rooms.value.find((room) => room.id === id)
  })

  const getBlocksByRoom = computed(() => {
    return (id: number): BlockMessages[] => blocks.value[0].filter((block) => block.room.id === id)
  })

  const setBlocks = (bs: TupleBlock) => (blocks.value = bs)

  const firstUnread = computed((): Message | undefined => blocks.value[2])

  const setMessage = (dto: MessageGetDto) => {
    const room = rooms.value.find((r) => r.id === dto.idRoom)
    const roomIndex = rooms.value.findIndex((r) => r.id === dto.idRoom)
    if (room) {
      room.lastMessage = dto.message
      room.updatedAt = dto.message.createdAt

      if (dto.message.author.username !== user.value?.username) room.countUnreadingMessage++

      rooms.value.unshift(...rooms.value.splice(roomIndex, 1))
    }

    if (activeRoom.value !== room?.id) return

    if (dto.block) {
      return blocks.value[0].push(dto.block)
    }

    blocks.value[0].at(-1)?.messages.push(dto.message)
  }

  const unreadMessages = computed(() => {
    const b = blocks.value[0]
      .map((b) => {
        const m = b.messages.map((m) => {
          const isExist = m.isNotRead.find((u) => u.id === user.value?.id)

          if (isExist) {
            return m.id
          }
        })

        return m.filter((ms) => ms)
      })
      .flat()

    return b
  })

  const setIsNotRead = (id: number, isNotRead: UserChat[]) => {
    blocks.value[0].forEach((b) => {
      const message = b.messages.find((m) => m.id === id)

      if (message) {
        message.isNotRead = isNotRead

        const room = rooms.value.find((r) => r.id === b.room.id)

        if (room && message.author.username !== user.value?.username) room.countUnreadingMessage--
      }
    })

    blocks.value[2] = undefined
  }

  const setUserIsOnlineInRoom = (id: number, isOnline = true) => {
    if (id === user.value?.id) return

    rooms.value.forEach((room) => {
      const user = room.users.find((u) => u.id === id)

      if (user) {
        user.isOnline = isOnline
      }
    })
  }

  const findRoomById = computed(
    () =>
      (id: number): IRoom | undefined =>
        rooms.value.find((r) => r.id === id)
  )

  const deleteMessage = (message: Message) => {
    const block = blocks.value[0].find((b) => b.id === (message.block as BlockMessages).id)

    if (block) {
      block.messages = block.messages.filter((m) => m.id !== message.id)

      if (!block.messages.length && !block.notifies.length) {
        blocks.value[0] = blocks.value[0].filter((b) => b.id !== block.id)
      }
    }

    const room = rooms.value.find((r) => r.id === activeRoom.value)
    if (room) {
      room.lastMessage = message.lastMessage

      rooms.value.sort((b, a) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    }
  }

  const editMessage = (message: Message) => {
    const block = blocks.value[0].find((b) => b.messages.find((m) => m.id === message.id))

    if (block) {
      const findingMessage = block.messages.find((m) => m.id === message.id)
      const room = rooms.value.find((r) => r.id === block.room.id)

      if (findingMessage) {
        findingMessage.isEdit = message.isEdit
        findingMessage.body = message.body

        if (room) {
          if (room.lastMessage?.id === findingMessage.id) {
            room.lastMessage.body = findingMessage.body
          }
        }
      }
    }
  }

  const editRoom = (editingRoom: IRoom) => {
    const room = rooms.value.find((r) => r.id === editingRoom.id)

    if (room) {
      room.avatarPath = editingRoom.avatarPath
      room.updatedAt = editingRoom.updatedAt
      room.name = editingRoom.name
    }
  }

  const updateUserInRooms = (editingUser: IUserDto) => {
    for (const room of rooms.value) {
      if (room.type === 'PRIVATE' && room.users.find((u) => u.id === editingUser.id)) {
        room.avatarPath = editingUser.avatarPath
        room.name = editingUser.username
      }

      if (room.lastMessage?.author.id === editingUser.id) {
        room.lastMessage.author.avatarPath = editingUser.avatarPath
        room.lastMessage.author.username = editingUser.username
      }

      for (const user of room.users) {
        if (user.id === editingUser.id) {
          user.avatarPath = editingUser.avatarPath
          user.username = editingUser.username
        }
      }
    }

    for (const block of blocks.value[0]) {
      for (const message of block.messages) {
        if (message.author.id === editingUser.id) {
          message.author.avatarPath = editingUser.avatarPath
          message.author.username = editingUser.username
        }
      }
    }
  }

  const appendUsers = (newUsers: UserChat[], id: number) => {
    const room = rooms.value.find((r) => r.id === id)

    if (room) {
      room.users.push(...newUsers)

      // room.updatedAt = notify.createdAt
    }
  }

  const appendRoom = (room: IRoom) => {
    rooms.value.unshift(room)
  }

  const deleteRoom = (id: number) => {
    rooms.value = rooms.value.filter((r) => r.id !== id)
  }

  const updateRoomUsers = (users: UserChat[], id: number) => {
    const room = rooms.value.find((r) => r.id === id)

    if (room) {
      room.users = users
    }
  }

  return {
    rooms,
    blocks,
    activeRoom,
    setRooms,
    filteredRooms,
    getRoomById,
    getBlocksByRoom,
    setBlocks,
    firstUnread,
    setActiveRoom,
    setMessage,
    unreadMessages,
    setIsNotRead,
    findRoomById,
    setUserIsOnlineInRoom,
    deleteMessage,
    editMessage,
    editRoom,
    updateUserInRooms,
    appendUsers,
    appendRoom,
    deleteRoom,
    updateRoomUsers
  }
})
