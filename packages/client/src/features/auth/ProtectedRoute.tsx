import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    checkAuth().finally(() => setChecked(true))
  }, [checkAuth])

  if (!checked || isLoading) {
    return (
      <div className="login-bg">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
