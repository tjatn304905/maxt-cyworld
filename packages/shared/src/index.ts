// ===== Auth Types =====
export type UserRole = 'ADMIN' | 'WRITER' | 'USER'

export interface User {
  id: string
  name: string
  email: string
  nickname: string
  role: UserRole
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupAvatarSelection {
  hairId?: number
  faceId?: number
  clothId?: number
  bottomId?: number
  accessoryId?: number
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  nickname: string
  avatar?: SignupAvatarSelection
}

export interface AuthResponse {
  token: string
  user: User
}

// ===== Admin Types =====
export interface AdminUserSummary {
  id: string
  email: string
  name: string
  nickname: string
  role: UserRole
  createdAt: string
}

export interface UpdateUserRoleRequest {
  role: 'WRITER' | 'USER'
}

// ===== Avatar Types =====
export type HeadType = 'default' | 'cat' | 'bear' | 'bunny' | 'crown'
export type BodyType = 'default' | 'suit' | 'casual' | 'sporty' | 'hoodie'
export type FaceType = 'default' | 'smile' | 'wink' | 'sleepy' | 'cool'
export type BottomType = 'default' | 'jeans' | 'shorts' | 'skirt' | 'training'
export type AccessoryType = 'none' | 'glasses' | 'hat' | 'scarf' | 'headphones'

export interface AvatarConfig {
  size?: number
  head?: HeadType
  body?: BodyType
  face?: FaceType
  bottom?: BottomType
  accessory?: AccessoryType
  color?: string
}

export type ItemCategory = 'HAIR' | 'FACE' | 'CLOTHES' | 'BOTTOM' | 'ACCESSORY'

export interface AvatarItem {
  id: number
  category: ItemCategory
  name: string
  imageUrl: string
  isDefault: boolean
  renderKey: string | null
}

export interface EquippedItem {
  id: number
  name: string
  imageUrl: string
  renderKey: string | null
}

export interface UserAvatar {
  hair: EquippedItem | null
  face: EquippedItem | null
  cloth: EquippedItem | null
  bottom: EquippedItem | null
  accessory: EquippedItem | null
}

export interface UpdateAvatarRequest {
  hairId?: number
  faceId?: number
  clothId?: number
  bottomId?: number
  accessoryId?: number
}

// ===== Post Types =====
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
  sortOrder: number
}

export interface CreatePostRequest {
  category: string
  title: string
  content: string
  eventDate: string
  images?: { imageUrl: string }[]
}

export interface UpdatePostRequest {
  category?: string
  title?: string
  content?: string
  eventDate?: string
  images?: { imageUrl: string }[]
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
  updatedAt?: string
}

// ===== BGM Types =====
export interface BgmTrack {
  id: number
  title: string
  artist: string
  fileUrl: string
  sortOrder: number
}

export interface CreateBgmTrackRequest {
  title: string
  artist: string
  fileUrl: string
  sortOrder?: number
}

// ===== Upload Types =====
export interface UploadResponse {
  url: string
}

// ===== Gallery Types (사진첩 = 게시글 이미지 모아보기) =====
export interface GalleryImage {
  id: number
  imageUrl: string
  postId: number
  postTitle: string
  eventDate: string
}

// ===== Legacy UI Types (client UI helpers) =====
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
