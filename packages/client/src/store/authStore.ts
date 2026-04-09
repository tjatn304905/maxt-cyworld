import { create } from 'zustand'
import type { User } from '../types'
import * as authService from '../services/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, ilchonName: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await authService.login({ email, password })
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || '로그인에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  signup: async (name, email, password, ilchonName) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await authService.signup({ name, email, password, ilchonName })
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || '회원가입에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = authService.getStoredToken()
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }
    set({ isLoading: true })
    try {
      const user = await authService.getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      authService.logout()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
