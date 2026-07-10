import type {
  HistoryPost,
  PostImage,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
} from '../types'
import api from './http'

export interface PostListResponse {
  data: HistoryPost[]
  total: number
  page: number
  limit: number
}

export type PostDetail = HistoryPost & { images: PostImage[] }

export async function getPosts(params?: {
  category?: string
  page?: number
  limit?: number
}) {
  const res = await api.get<PostListResponse>('/posts', { params })
  return res.data
}

export async function getPost(id: number) {
  const res = await api.get<PostDetail>(`/posts/${id}`)
  return res.data
}

export async function createPost(data: CreatePostRequest) {
  const res = await api.post<{ id: number }>('/posts', data)
  return res.data
}

export async function updatePost(id: number, data: UpdatePostRequest) {
  const res = await api.put(`/posts/${id}`, data)
  return res.data
}

export async function deletePost(id: number) {
  const res = await api.delete(`/posts/${id}`)
  return res.data
}

// ===== Comments =====
export async function getPostComments(postId: number) {
  const res = await api.get<Comment[]>(`/posts/${postId}/comments`)
  return res.data
}

export async function addPostComment(postId: number, data: { content: string; parentId?: number }) {
  const res = await api.post(`/posts/${postId}/comments`, data)
  return res.data
}

export async function updatePostComment(postId: number, commentId: number, content: string) {
  const res = await api.put(`/posts/${postId}/comments/${commentId}`, { content })
  return res.data
}

export async function deletePostComment(postId: number, commentId: number) {
  const res = await api.delete(`/posts/${postId}/comments/${commentId}`)
  return res.data
}

// ===== Likes =====
export async function toggleLike(postId: number) {
  const res = await api.post<{ liked: boolean }>(`/posts/${postId}/like`)
  return res.data
}

export async function getLikeStatus(postId: number) {
  const res = await api.get<{ liked: boolean; count: number }>(`/posts/${postId}/like`)
  return res.data
}
