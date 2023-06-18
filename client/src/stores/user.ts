import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/axios'
import type { IUserDto } from '@/api/dto/User.dto'
import type { INewUser, IUser } from '@/types/Users'
import type { ISignInUpDto } from '@/api/dto/Sign_In.dto'
import type { AxiosError } from 'axios'
import type { ErrorBody } from '@/types/ErrorBody'

export const useUserStore = defineStore('user', () => {
  const user = ref<IUserDto>()
  const error = ref<ErrorBody>({
    message: '',
    statusCode: 200,
    error: ''
  })

  const getUser = async () => {
    clearError()

    try {
      const token = localStorage.getItem('token') || ''

      const payload = await api.post<IUserDto>('user/getUser', { token })

      user.value = payload.data
    } catch (ex: any) {
      error.value = (ex as AxiosError).response?.data as ErrorBody
    }
  }

  const signIn = async (data: IUser) => {
    clearError()

    try {
      const payload = await api.post<ISignInUpDto>('user/login', {
        email: data.Email.value,
        password: data.Password.value
      })

      user.value = payload.data.user

      localStorage.setItem('token', payload.data.accessToken)
    } catch (ex: any) {
      error.value = (ex as AxiosError).response?.data as ErrorBody
    }
  }

  const signUp = async (data: INewUser) => {
    clearError()

    try {
      const payload = await api.post<ISignInUpDto>('user/register/', {
        username: data.Username.value,
        email: data.Email.value,
        password: data.Password.value,
        avatarPath: ''
      })

      user.value = payload.data.user

      localStorage.setItem('token', payload.data.accessToken)
    } catch (ex: any) {
      error.value = (ex as AxiosError).response?.data as ErrorBody
    }
  }

  const logout = async () => {
    clearError()

    try {
      await api.post('user/logout', null, { withCredentials: true })

      localStorage.removeItem('token')
    } catch (ex: any) {
      error.value = (ex as AxiosError).response?.data as ErrorBody
    }
  }

  const setUser = (value: undefined | IUserDto) => {
    user.value = value
  }

  const clearError = () => {
    error.value = {
      message: '',
      statusCode: 200,
      error: ''
    }
  }

  const updateUser = (value: IUserDto) => {
    if (user.value) {
      user.value.username = value.username
      user.value.avatarPath = value.avatarPath
    }
  }

  return { user, error, signIn, signUp, getUser, clearError, logout, setUser, updateUser }
})
