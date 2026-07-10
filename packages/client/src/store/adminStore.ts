import { create } from 'zustand'
import type { AdminUserSummary, UpdateUserRoleRequest } from '../types'
import * as adminService from '../services/admin'

interface AdminState {
  members: AdminUserSummary[]
  total: number
  isLoading: boolean
  error: string | null
  fetchMembers: () => Promise<void>
  setRole: (userId: string, role: UpdateUserRoleRequest['role']) => Promise<void>
  clearError: () => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  members: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await adminService.getUsers({ limit: 100 })
      set({ members: res.data, total: res.total, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || '회원 목록을 불러오지 못했습니다.'
      set({ error: message, isLoading: false })
    }
  },

  setRole: async (userId, role) => {
    // optimistic update, rolled back on failure
    const prev = get().members
    set({
      members: prev.map((m) => (m.id === userId ? { ...m, role } : m)),
      error: null,
    })
    try {
      await adminService.updateUserRole(userId, role)
    } catch (err: any) {
      const message = err.response?.data?.error || '권한 변경에 실패했습니다.'
      set({ members: prev, error: message })
    }
  },

  clearError: () => set({ error: null }),
}))
