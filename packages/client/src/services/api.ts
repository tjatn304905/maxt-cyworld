import type { DiaryEntry, BoardPost, Comment, TeamMember, PhotoItem, HistoryPost } from '../types'
import api from './http'

const BASE_URL = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ===== Diary (legacy, still using local data) =====
export async function getDiaryEntries() {
  return fetchJson<DiaryEntry[]>(`${BASE_URL}/diary?_sort=date&_order=desc`)
}

export async function getDiaryEntry(id: number) {
  return fetchJson<DiaryEntry>(`${BASE_URL}/diary/${id}`)
}

// ===== Board (legacy, still using local data) =====
export async function getBoardPosts() {
  return fetchJson<BoardPost[]>(`${BASE_URL}/boardPosts?_sort=date&_order=desc`)
}

export async function getBoardPost(id: number) {
  return fetchJson<BoardPost>(`${BASE_URL}/boardPosts/${id}`)
}

export async function likePost(id: number, currentLikes: number) {
  const res = await fetch(`${BASE_URL}/boardPosts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes: currentLikes + 1 }),
  })
  return res.json() as Promise<BoardPost>
}

export async function getComments(postId: number) {
  return fetchJson<Comment[]>(`${BASE_URL}/comments?postId=${postId}`)
}

export async function addComment(comment: Omit<Comment, 'id'>) {
  const res = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  return res.json() as Promise<Comment>
}

export async function getMembers() {
  return fetchJson<TeamMember[]>(`${BASE_URL}/members`)
}

export async function getPhotos() {
  return fetchJson<PhotoItem[]>(`${BASE_URL}/photos?_sort=date&_order=desc`)
}

// ===== History Posts (new, DB-backed) =====
export async function getHistoryPosts(params?: { category?: string; page?: number; limit?: number }) {
  const res = await api.get<{ data: HistoryPost[]; total: number; page: number; limit: number }>('/posts', { params })
  return res.data
}

export async function getHistoryPost(id: number) {
  const res = await api.get<HistoryPost & { images: any[] }>(`/posts/${id}`)
  return res.data
}

export async function createHistoryPost(data: { category: string; title: string; content: string; eventDate: string; images?: { imageUrl: string }[] }) {
  const res = await api.post<{ id: number }>('/posts', data)
  return res.data
}

export async function updateHistoryPost(id: number, data: { category?: string; title?: string; content?: string; eventDate?: string }) {
  const res = await api.put(`/posts/${id}`, data)
  return res.data
}

export async function deleteHistoryPost(id: number) {
  const res = await api.delete(`/posts/${id}`)
  return res.data
}

// ===== Post Comments (new, DB-backed) =====
export async function getPostComments(postId: number) {
  const res = await api.get<Comment[]>(`/posts/${postId}/comments`)
  return res.data
}

export async function addPostComment(postId: number, data: { content: string; parentId?: number }) {
  const res = await api.post(`/posts/${postId}/comments`, data)
  return res.data
}

export async function deletePostComment(postId: number, commentId: number) {
  const res = await api.delete(`/posts/${postId}/comments/${commentId}`)
  return res.data
}

// ===== Likes (new, DB-backed) =====
export async function toggleLike(postId: number) {
  const res = await api.post<{ liked: boolean }>(`/posts/${postId}/like`)
  return res.data
}

export async function getLikeStatus(postId: number) {
  const res = await api.get<{ liked: boolean; count: number }>(`/posts/${postId}/like`)
  return res.data
}

// ===== Avatar (new, DB-backed) =====
export async function getAvatarItems(category?: string) {
  const res = await api.get('/avatar-items', { params: category ? { category } : {} })
  return res.data
}

export async function getMyAvatar() {
  const res = await api.get('/avatars/me')
  return res.data
}

export async function updateMyAvatar(data: { hairId?: number; faceId?: number; clothId?: number; accessoryId?: number }) {
  const res = await api.put('/avatars/me', data)
  return res.data
}
