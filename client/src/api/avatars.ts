import { api } from './axios'

export const uploadAvatar = async (file: File, type: string) => {
  const formData = new FormData()
  formData.set('avatar', file)
  formData.set('type', type)

  const response = await (
    await api.post('/file/uploadAvatar', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
  ).data

  return response
}
