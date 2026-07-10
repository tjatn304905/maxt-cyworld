import type { BgmTrack } from '../types'
import api from './http'

export async function getBgmTracks() {
  const res = await api.get<BgmTrack[]>('/bgm')
  return res.data
}
