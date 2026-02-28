import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuthStore } from '../../stores/useAdminAuthStore'

export function AdminProtectedRoute() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
