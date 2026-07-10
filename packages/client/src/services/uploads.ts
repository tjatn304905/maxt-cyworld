import type { UploadResponse } from '../types'
import api from './http'

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<UploadResponse>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
