import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Interview App
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-md bg-white px-3 py-1.5 shadow-md transition-shadow hover:shadow-lg"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
