import type { DiaryEntry, BoardPost, Comment, TeamMember, PhotoItem } from '../types'

const BASE_URL = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getDiaryEntries() {
  return fetchJson<DiaryEntry[]>(`${BASE_URL}/diary?_sort=date&_order=desc`)
}

export async function getDiaryEntry(id: number) {
  return fetchJson<DiaryEntry>(`${BASE_URL}/diary/${id}`)
}

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
