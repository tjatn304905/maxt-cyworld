import { create } from 'zustand'
import type { HistoryPost, Comment, CreatePostRequest, UpdatePostRequest } from '../types'
import type { PostDetail } from '../services/posts'
import * as postService from '../services/posts'

interface PostState {
  posts: HistoryPost[]
  total: number
  page: number
  limit: number
  category: string | null
  currentPost: PostDetail | null
  commentsByPost: Record<number, Comment[]>
  likedByPost: Record<number, boolean>
  isLoading: boolean
  error: string | null
  fetchPosts: (options?: { page?: number; limit?: number; category?: string | null }) => Promise<void>
  fetchPost: (id: number) => Promise<void>
  createPost: (data: CreatePostRequest) => Promise<number>
  updatePost: (id: number, data: UpdatePostRequest) => Promise<void>
  deletePost: (id: number) => Promise<void>
  fetchComments: (postId: number) => Promise<void>
  addComment: (postId: number, content: string, parentId?: number) => Promise<void>
  updateComment: (postId: number, commentId: number, content: string) => Promise<void>
  deleteComment: (postId: number, commentId: number) => Promise<void>
  fetchLikeStatus: (postId: number) => Promise<void>
  toggleLike: (postId: number) => Promise<void>
  clearError: () => void
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  total: 0,
  page: 1,
  limit: 20,
  category: null,
  currentPost: null,
  commentsByPost: {},
  likedByPost: {},
  isLoading: false,
  error: null,

  fetchPosts: async (options = {}) => {
    const page = options.page ?? 1
    const limit = options.limit ?? get().limit
    const category = options.category !== undefined ? options.category : get().category
    set({ isLoading: true, error: null })
    try {
      const res = await postService.getPosts({ category: category ?? undefined, page, limit })
      set({
        posts: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
        category,
        isLoading: false,
      })
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물을 불러오지 못했습니다.'
      set({ error: message, isLoading: false })
    }
  },

  fetchPost: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const detail = await postService.getPost(id)
      set({ currentPost: detail, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물을 불러오지 못했습니다.'
      set({ error: message, isLoading: false, currentPost: null })
    }
  },

  createPost: async (data) => {
    set({ error: null })
    try {
      const { id } = await postService.createPost(data)
      await get().fetchPosts({ page: 1 })
      return id
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물 작성에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  updatePost: async (id, data) => {
    set({ error: null })
    try {
      await postService.updatePost(id, data)
      if (get().currentPost?.id === id) {
        await get().fetchPost(id)
      }
      await get().fetchPosts({ page: get().page })
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물 수정에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  deletePost: async (id) => {
    set({ error: null })
    try {
      await postService.deletePost(id)
      if (get().currentPost?.id === id) {
        set({ currentPost: null })
      }
      await get().fetchPosts({ page: 1 })
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물 삭제에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  fetchComments: async (postId) => {
    try {
      const comments = await postService.getPostComments(postId)
      set((state) => ({ commentsByPost: { ...state.commentsByPost, [postId]: comments } }))
    } catch (err: any) {
      const message = err.response?.data?.error || '댓글을 불러오지 못했습니다.'
      set({ error: message })
    }
  },

  addComment: async (postId, content, parentId) => {
    set({ error: null })
    try {
      await postService.addPostComment(postId, { content, parentId })
      await get().fetchComments(postId)
      bumpCount(set, postId, 'commentCount', 1)
    } catch (err: any) {
      const message = err.response?.data?.error || '댓글 작성에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  updateComment: async (postId, commentId, content) => {
    set({ error: null })
    try {
      await postService.updatePostComment(postId, commentId, content)
      await get().fetchComments(postId)
    } catch (err: any) {
      const message = err.response?.data?.error || '댓글 수정에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  deleteComment: async (postId, commentId) => {
    set({ error: null })
    try {
      await postService.deletePostComment(postId, commentId)
      await get().fetchComments(postId)
      bumpCount(set, postId, 'commentCount', -1)
    } catch (err: any) {
      const message = err.response?.data?.error || '댓글 삭제에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  fetchLikeStatus: async (postId) => {
    try {
      const { liked } = await postService.getLikeStatus(postId)
      set((state) => ({ likedByPost: { ...state.likedByPost, [postId]: liked } }))
    } catch {
      // like status is non-critical; ignore failures
    }
  },

  toggleLike: async (postId) => {
    // optimistic update, rolled back on failure
    const prevLiked = get().likedByPost[postId] ?? false
    const delta = prevLiked ? -1 : 1
    set((state) => ({ likedByPost: { ...state.likedByPost, [postId]: !prevLiked } }))
    bumpCount(set, postId, 'likeCount', delta)
    try {
      await postService.toggleLike(postId)
    } catch (err: any) {
      set((state) => ({ likedByPost: { ...state.likedByPost, [postId]: prevLiked } }))
      bumpCount(set, postId, 'likeCount', -delta)
      const message = err.response?.data?.error || '좋아요 처리에 실패했습니다.'
      set({ error: message })
    }
  },

  clearError: () => set({ error: null }),
}))

type SetFn = (fn: (state: PostState) => Partial<PostState>) => void

function bumpCount(set: SetFn, postId: number, key: 'likeCount' | 'commentCount', delta: number) {
  set((state) => ({
    posts: state.posts.map((p) =>
      p.id === postId ? { ...p, [key]: Math.max(0, p[key] + delta) } : p
    ),
    currentPost:
      state.currentPost && state.currentPost.id === postId
        ? { ...state.currentPost, [key]: Math.max(0, state.currentPost[key] + delta) }
        : state.currentPost,
  }))
}
