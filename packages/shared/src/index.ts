// ===== Auth Types =====
export interface User {
  id: string
  name: string
  email: string
  nickname: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  nickname: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ===== Avatar Types =====
export type HeadType = 'default' | 'cat' | 'bear' | 'bunny' | 'crown'
export type BodyType = 'default' | 'suit' | 'casual' | 'sporty' | 'hoodie'
export type AccessoryType = 'none' | 'glasses' | 'hat' | 'scarf' | 'headphones'

export interface AvatarConfig {
  size?: number
  head?: HeadType
  body?: BodyType
  accessory?: AccessoryType
  color?: string
}

export type ItemCategory = 'HAIR' | 'FACE' | 'CLOTHES' | 'ACCESSORY'

export interface AvatarItem {
  id: number
  category: ItemCategory
  name: string
  imageUrl: string
  isDefault: boolean
}

export interface UserAvatar {
  hair: { id: number; name: string; imageUrl: string } | null
  face: { id: number; name: string; imageUrl: string } | null
  cloth: { id: number; name: string; imageUrl: string } | null
  accessory: { id: number; name: string; imageUrl: string } | null
}

// ===== Data Types =====
export interface DiaryEntry {
  id: number
  title: string
  date: string
  category: 'Event' | 'Workshop' | 'Meeting'
  content: string
  author: string
}

export interface HistoryPost {
  id: number
  category: string
  title: string
  content: string
  eventDate: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    nickname: string
  }
  representativeImage: string | null
  likeCount: number
  commentCount: number
}

export interface PostImage {
  id: number
  imageUrl: string
  isRepresentative: boolean
}

export interface BoardPost {
  id: number
  title: string
  content: string
  author: string
  date: string
  likes: number
}

export interface Comment {
  id: number
  postId: number
  parentId: number | null
  userId?: string
  author: string | { name: string; nickname: string }
  content: string
  date?: string
  createdAt?: string
}

export interface PhotoItem {
  id: number
  title: string
  date: string
  description: string
  color: string
}

export interface MusicTrack {
  id: number
  title: string
  artist: string
}

export interface TeamMember {
  name: string
  head: HeadType
  body: BodyType
  accessory: AccessoryType
  x: number
  y: number
}

export interface Mood {
  label: string
  value: string
}

export interface TabItem {
  to: string
  label: string
}
