// ===== Auth Types =====
export interface User {
  id: string
  name: string
  email: string
  ilchonName: string
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
  ilchonName: string
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

// ===== Data Types =====
export interface DiaryEntry {
  id: number
  title: string
  date: string
  category: 'Event' | 'Workshop' | 'Meeting'
  content: string
  author: string
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
  author: string
  content: string
  date: string
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
