import api from './http'
import type { LoginRequest, SignupRequest, AuthResponse, User } from '../types'

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data)
  localStorage.setItem('maxt-token', res.data.token)
  return res.data
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/signup', data)
  localStorage.setItem('maxt-token', res.data.token)
  return res.data
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ user: User }>('/auth/me')
  return res.data.user
}

export function logout() {
  localStorage.removeItem('maxt-token')
}

export function getStoredToken(): string | null {
  return localStorage.getItem('maxt-token')
}
