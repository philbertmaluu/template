import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/** Add new pages here to show them in the sidebar. */
const navItems = [{ to: '/', label: 'Tasks', icon: 'M9 12l2 2 4-4M5 7h14M5 17h14' }]

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
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-4 left-4 z-40 flex w-64 flex-col rounded-2xl bg-white p-4 shadow-xl transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'
        }`}
      >
        <div className="mb-8 px-2 text-lg font-semibold">Interview App</div>

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
                    ? 'bg-maroon text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon path={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-xl bg-gray-50 p-3 shadow-inner">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="mb-3 truncate text-xs text-gray-500">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full rounded-md bg-white px-3 py-1.5 text-sm shadow-md transition-shadow hover:shadow-lg"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
