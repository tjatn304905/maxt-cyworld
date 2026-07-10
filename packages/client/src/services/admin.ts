import type { AdminUserSummary, UpdateUserRoleRequest } from '../types'
import api from './http'

export interface AdminUserListResponse {
  data: AdminUserSummary[]
  total: number
  page: number
  limit: number
}

export async function getUsers(params?: { page?: number; limit?: number }) {
  const res = await api.get<AdminUserListResponse>('/admin/users', { params })
  return res.data
}

export async function updateUserRole(userId: string, role: UpdateUserRoleRequest['role']) {
  const res = await api.patch(`/admin/users/${userId}/role`, { role })
  return res.data
}
