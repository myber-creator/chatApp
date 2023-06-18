import axios from 'axios'
import type { ISignInUpDto } from './dto/Sign_In.dto'

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true
})

api.interceptors.response.use(
  (config) => {
    return config
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && error.config && !error.config._isRetry) {
      originalRequest._isRetry = true

      try {
        const response = await api.get<ISignInUpDto>('/user/login/refresh', {
          withCredentials: true
        })

        localStorage.setItem('token', response.data.accessToken)
        return api.request(originalRequest)
      } catch (e) {
        console.log('UnAuthorized!')
      }
    }
    throw error
  }
)

export const getAnotherUsers = async (id: number, idRoom?: number) => {
  const response = await api.post(
    '/user/anotherUsers',
    { id: idRoom, ownerId: id },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )

  return await response.data
}
