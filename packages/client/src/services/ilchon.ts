import type { IlchonComment, CreateIlchonCommentRequest } from '../types'
import api from './http'

export async function getIlchonComments() {
  const res = await api.get<IlchonComment[]>('/ilchon')
  return res.data
}

export async function addIlchonComment(data: CreateIlchonCommentRequest) {
  const res = await api.post<{ id: number; message: string }>('/ilchon', data)
  return res.data
}

export async function updateIlchonComment(id: number, content: string) {
  const res = await api.put<{ message: string }>(`/ilchon/${id}`, { content })
  return res.data
}

export async function deleteIlchonComment(id: number) {
  const res = await api.delete<{ message: string }>(`/ilchon/${id}`)
  return res.data
}
