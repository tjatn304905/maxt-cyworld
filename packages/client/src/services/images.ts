import type { GalleryImage } from '../types'
import api from './http'

export interface GalleryResponse {
  data: GalleryImage[]
  total: number
  page: number
  limit: number
}

export async function getImages(params?: { page?: number; limit?: number }) {
  const res = await api.get<GalleryResponse>('/images', { params })
  return res.data
}
