import type { AvatarItem, UserAvatar, UpdateAvatarRequest } from '../types'
import api from './http'

export async function getAvatarItems(category?: string) {
  const res = await api.get<AvatarItem[]>('/avatar-items', {
    params: category ? { category } : {},
  })
  return res.data
}

export async function getMyAvatar() {
  const res = await api.get<UserAvatar>('/avatars/me')
  return res.data
}

export async function updateMyAvatar(data: UpdateAvatarRequest) {
  const res = await api.put('/avatars/me', data)
  return res.data
}
