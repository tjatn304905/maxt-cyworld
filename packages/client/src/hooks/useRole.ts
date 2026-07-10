import { useAuthStore } from '../store/authStore'

// role helpers derived from the logged-in user
export function useRole() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'USER'
  return {
    role,
    isAdmin: role === 'ADMIN',
    canWrite: role === 'ADMIN' || role === 'WRITER',
  }
}
