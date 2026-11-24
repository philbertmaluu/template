import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-gray-500">
      Loading...
    </div>
  )
}

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  return user ? <Navigate to="/" replace /> : <Outlet />
}
