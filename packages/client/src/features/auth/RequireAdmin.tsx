import { Navigate, Outlet } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'

export default function RequireAdmin() {
  const { isAdmin } = useRole()

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
