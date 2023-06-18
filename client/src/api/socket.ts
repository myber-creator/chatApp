import { io, Socket as ISocket } from 'socket.io-client'
import { api } from './axios'
import { useRoomsStore } from '@/stores/rooms'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import type { ISignInUpDto } from './dto/Sign_In.dto'
import type { IRoom } from '@/types/Room'
import type { MessageEditDto, MessageSendDto, MessagesReadDto } from './dto/Message.dto'
import type { EditRoomDto } from './dto/EditRoomDto'
import type { UserEditDto } from './dto/User.dto'
import type { RoomCreateDto } from './dto/Room'

const roomsStore = useRoomsStore()
const {
  setRooms,
  setBlocks,
  setActiveRoom,
  setMessage,
  setIsNotRead,
  setUserIsOnlineInRoom,
  deleteMessage,
  editMessage,
  editRoom,
  updateUserInRooms,
  appendUsers,
  appendRoom,
  deleteRoom,
  updateRoomUsers
} = roomsStore
const { rooms: roomsFromStore, unreadMessages, activeRoom } = storeToRefs(roomsStore)

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { updateUser } = userStore

export class Socket {
  private socket: ISocket
  private lastEmit: { name: string; data?: any }

  constructor(url: string = 'https://chatapp-production-191e.up.railway.app') {
    this.socket = io(url, {
      auth: { token: localStorage.getItem('token') || '' }
    })

    this.lastEmit = { name: '' }

    this.initEmits()
  }

  private initEmits() {
    this.socket.on('connect', () => {
      console.log('connect')
    })

    this.socket.on('rooms', (rooms: IRoom[]) => {
      console.log(rooms)

      setRooms(rooms)
    })

    this.socket.on('disconnect', (reason) => {
      console.log(reason)
    })

    this.socket.on('Error', (error) => {
      console.log(error)
    })

    this.socket.on('exception', async (error) => {
      if (error.status === 401) {
        const response = await api.get<ISignInUpDto>('/user/login/refresh', {
          withCredentials: true
        })

        localStorage.setItem('token', response.data.accessToken)

        this.socket.auth = { token: response.data.accessToken }
        this.socket.disconnect().connect()

        this.socket.emit(this.lastEmit.name, this.lastEmit.data)

        this.lastEmit = { name: '' }
      }
    })

    this.socket.on('getBlocksRoom', (blocks) => {
      setBlocks(blocks)

      console.log(blocks)
    })

    this.socket.on('sendMessage', (message) => {
      setMessage(message)
    })

    this.socket.on('readMessage', (messages) => {
      messages.forEach((m: MessagesReadDto) => {
        setIsNotRead(m.id, m.isNotRead)
      })
    })

    this.socket.on('deleteMessage', (message) => {
      deleteMessage(message)
    })

    this.socket.on('editMessage', (message) => {
      editMessage(message)
    })

    this.socket.on('editRoom', (room) => {
      editRoom(room)
    })

    this.socket.on('editUser', (editingUser) => {
      if (editingUser.id === user.value?.id) updateUser(editingUser)

      updateUserInRooms(editingUser)
    })

    this.socket.on('joinedNewUsers', ({ newUsers, room }) => {
      appendUsers(newUsers, room)
    })

    this.socket.on('leaveFromRoom', ({ initiator, users, room }) => {
      if (!initiator) {
        return deleteRoom(room)
      }

      updateRoomUsers(users, room)
    })

    this.socket.on('newRoom', (room) => {
      appendRoom(room)
    })

    this.socket.on('user-connect', (id) => {
      setUserIsOnlineInRoom(id)
    })

    this.socket.on('user-disconnect', (id) => {
      setUserIsOnlineInRoom(id, false)
    })
  }

  public getBlocks(id: number) {
    this.socket.emit('getBlocksRoom', { id })
    this.lastEmit = { name: 'getBlocksRoom', data: { id } }
    setActiveRoom(id)
  }

  public sendMessage(message: MessageSendDto) {
    this.socket.emit('sendMessage', JSON.stringify(message))
    this.lastEmit = { name: 'sendMessage', data: JSON.stringify(message) }
  }

  public editMessage(message: MessageEditDto) {
    this.socket.emit('editMessage', JSON.stringify(message))
    this.lastEmit = { name: 'editMessage', data: JSON.stringify(message) }
  }

  public readMessage() {
    if (unreadMessages.value) {
      this.socket.emit('readMessage', JSON.stringify({ ids: unreadMessages.value }))
      this.lastEmit = { name: 'readMessage', data: JSON.stringify({ ids: unreadMessages.value }) }
    }
  }

  public deleteMessage(id: number) {
    this.socket.emit('deleteMessage', JSON.stringify({ id, roomId: activeRoom.value }))
    this.lastEmit = {
      name: 'deleteMessage',
      data: JSON.stringify({ id, roomId: activeRoom.value })
    }
  }

  public editRoom(dto: EditRoomDto) {
    this.socket.emit('editRoom', JSON.stringify(dto))
    this.lastEmit = {
      name: 'editRoom',
      data: JSON.stringify(dto)
    }
  }

  public editUser(dto: UserEditDto) {
    this.socket.emit('editUser', JSON.stringify(dto))
    this.lastEmit = {
      name: 'editUser',
      data: JSON.stringify(dto)
    }
  }

  public appendUsers(idRoom: number, ids: number[]) {
    this.socket.emit('addUsersToRoom', JSON.stringify({ idRoom, users: ids }))
    this.lastEmit = {
      name: 'addUsersToRoom',
      data: JSON.stringify({ idRoom, users: ids })
    }
  }

  public createRoom(dto: RoomCreateDto) {
    console.log(dto)

    this.socket.emit('createRoom', JSON.stringify(dto))
    this.lastEmit = {
      name: 'createRoom',
      data: JSON.stringify(dto)
    }
  }

  public leaveFromRoom(id: number) {
    this.socket.emit('leaveFromRoom', JSON.stringify({ id }))
    this.lastEmit = {
      name: 'leaveFromRoom',
      data: JSON.stringify({ id })
    }
  }

  public disconnect() {
    this.socket.disconnect()
  }
}
