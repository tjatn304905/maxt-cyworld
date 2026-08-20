import { create } from 'zustand'
import type { IlchonComment } from '../types'
import * as ilchonService from '../services/ilchon'

interface IlchonState {
  comments: IlchonComment[]
  isLoaded: boolean
  error: string | null
  fetchComments: () => Promise<void>
  addComment: (content: string) => Promise<void>
  updateComment: (id: number, content: string) => Promise<void>
  deleteComment: (id: number) => Promise<void>
  clearError: () => void
}

export const useIlchonStore = create<IlchonState>((set, get) => ({
  comments: [],
  isLoaded: false,
  error: null,

  fetchComments: async () => {
    try {
      const comments = await ilchonService.getIlchonComments()
      set({ comments, isLoaded: true })
    } catch (err: any) {
      const message = err.response?.data?.error || '일촌평을 불러오지 못했습니다.'
      set({ error: message, isLoaded: true })
    }
  },

  addComment: async (content) => {
    set({ error: null })
    try {
      await ilchonService.addIlchonComment({ content })
      await get().fetchComments()
    } catch (err: any) {
      const message = err.response?.data?.error || '일촌평 작성에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  updateComment: async (id, content) => {
    set({ error: null })
    try {
      await ilchonService.updateIlchonComment(id, content)
      await get().fetchComments()
    } catch (err: any) {
      const message = err.response?.data?.error || '일촌평 수정에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  deleteComment: async (id) => {
    set({ error: null })
    try {
      await ilchonService.deleteIlchonComment(id)
      await get().fetchComments()
    } catch (err: any) {
      const message = err.response?.data?.error || '일촌평 삭제에 실패했습니다.'
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
