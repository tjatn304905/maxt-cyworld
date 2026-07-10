import { create } from 'zustand'
import type { HistoryPost, PostType, Comment, CreatePostRequest, UpdatePostRequest } from '../types'
import * as postService from '../services/posts'

interface PostListState {
  posts: HistoryPost[]
  total: number
  page: number
  limit: number
}

const emptyList = (): PostListState => ({ posts: [], total: 0, page: 1, limit: 20 })

interface PostState {
  lists: Record<PostType, PostListState>
  commentsByPost: Record<number, Comment[]>
  likedByPost: Record<number, boolean>
  isLoading: boolean
  error: string | null
  fetchPosts: (type: PostType, page?: number, limit?: number) => Promise<void>
  createPost: (data: CreatePostRequest) => Promise<void>
  updatePost: (id: number, type: PostType, data: UpdatePostRequest) => Promise<void>
  deletePost: (id: number, type: PostType) => Promise<void>
  fetchComments: (postId: number) => Promise<void>
  addComment: (postId: number, type: PostType, content: string, parentId?: number) => Promise<void>
  updateComment: (postId: number, commentId: number, content: string) => Promise<void>
  deleteComment: (postId: number, type: PostType, commentId: number) => Promise<void>
  fetchLikeStatus: (postId: number) => Promise<void>
  toggleLike: (postId: number, type: PostType) => Promise<void>
  clearError: () => void
}

export const usePostStore = create<PostState>((set, get) => ({
  lists: {
    DIARY: emptyList(),
    PHOTO: emptyList(),
    BOARD: emptyList(),
  },
  commentsByPost: {},
  likedByPost: {},
  isLoading: false,
  error: null,

  fetchPosts: async (type, page = 1, limit = 20) => {
    set({ isLoading: true, error: null })
    try {
      const res = await postService.getPosts({ type, page, limit })
      set((state) => ({
        lists: { ...state.lists, [type]: { posts: res.data, total: res.total, page: res.page, limit: res.limit } },
        isLoading: false,
      }))
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물을 불러오지 못했습니다.'
      set({ error: message, isLoading: false })
    }
  },

  createPost: async (data) => {
    set({ error: null })
    try {
      await postService.createPost(data)
      const type = data.postType ?? 'BOARD'
      await get().fetchPosts(type, 1, get().lists[type].limit)
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물 작성에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  updatePost: async (id, type, data) => {
    set({ error: null })
    try {
      await postService.updatePost(id, data)
      const list = get().lists[type]
      await get().fetchPosts(type, list.page, list.limit)
    } catch (err: any) {
      const message = err.response?.data?.error || '게시물 수정에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  deletePost: async (id, type) => {
    set({ error: null })
    try {
      await postService.deletePost(id)
      const list = get().lists[type]
      await get().fetchPosts(type, list.page, list.limit)
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

  addComment: async (postId, type, content, parentId) => {
    set({ error: null })
    try {
      await postService.addPostComment(postId, { content, parentId })
      await get().fetchComments(postId)
      bumpCommentCount(set, type, postId, 1)
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

  deleteComment: async (postId, type, commentId) => {
    set({ error: null })
    try {
      await postService.deletePostComment(postId, commentId)
      await get().fetchComments(postId)
      bumpCommentCount(set, type, postId, -1)
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

  toggleLike: async (postId, type) => {
    // optimistic update, rolled back on failure
    const prevLiked = get().likedByPost[postId] ?? false
    const delta = prevLiked ? -1 : 1
    set((state) => ({ likedByPost: { ...state.likedByPost, [postId]: !prevLiked } }))
    bumpLikeCount(set, type, postId, delta)
    try {
      await postService.toggleLike(postId)
    } catch (err: any) {
      set((state) => ({ likedByPost: { ...state.likedByPost, [postId]: prevLiked } }))
      bumpLikeCount(set, type, postId, -delta)
      const message = err.response?.data?.error || '좋아요 처리에 실패했습니다.'
      set({ error: message })
    }
  },

  clearError: () => set({ error: null }),
}))

type SetFn = (fn: (state: PostState) => Partial<PostState>) => void

function bumpLikeCount(set: SetFn, type: PostType, postId: number, delta: number) {
  set((state) => ({
    lists: {
      ...state.lists,
      [type]: {
        ...state.lists[type],
        posts: state.lists[type].posts.map((p) =>
          p.id === postId ? { ...p, likeCount: Math.max(0, p.likeCount + delta) } : p
        ),
      },
    },
  }))
}

function bumpCommentCount(set: SetFn, type: PostType, postId: number, delta: number) {
  set((state) => ({
    lists: {
      ...state.lists,
      [type]: {
        ...state.lists[type],
        posts: state.lists[type].posts.map((p) =>
          p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount + delta) } : p
        ),
      },
    },
  }))
}
