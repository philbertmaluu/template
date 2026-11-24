import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/** Add new pages here to show them in the sidebar. */
const navItems = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { to: '/tasks', label: 'Tasks', icon: 'M9 12l2 2 4-4M5 7h14M5 17h14' },
]

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-x-0 top-[100px] bottom-0 z-30 bg-black/20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-[100px] bottom-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white p-4 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-maroon text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon path={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-xl bg-maroon p-3 text-white shadow-md">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="mb-3 truncate text-xs text-white/80">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md transition-shadow hover:shadow-lg"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
