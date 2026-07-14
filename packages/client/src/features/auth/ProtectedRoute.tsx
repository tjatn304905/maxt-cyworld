import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import CyLoader from '../../components/ui/CyLoader'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    checkAuth().finally(() => setChecked(true))
  }, [checkAuth])

  if (!checked || isLoading) {
    return <CyLoader fullPage message='미니홈피 여는 중' />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
