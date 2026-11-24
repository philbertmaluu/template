import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/** Change this to the system name shown beside the logo. */
export const APP_NAME = 'Interview App'

function initials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Gold-bar label from the URL: "/" -> Dashboard, "/tasks" -> Tasks, "/my-tasks" -> My Tasks. */
function titleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop()
  if (!segment) return 'Dashboard'

  return decodeURIComponent(segment)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function AppHeader({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const moduleName = titleFromPath(pathname)
  const { user } = useAuth()
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullScreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <header className="fixed top-0 left-0 z-50 flex h-[100px] w-full flex-col border-b border-black/10 bg-white shadow-sm">
      <Link
        to="/"
        className="absolute top-0 left-3 z-10 h-[100px] w-[84px] overflow-hidden sm:left-6"
      >
        <img src="/logo.png" alt="NSSF" className="w-full drop-shadow-lg select-none" />
      </Link>

      <div className="flex h-[60px] items-center bg-[#902d30] pr-3 pl-28 text-white sm:pr-6 sm:pl-36">
        <Link to="/" className="truncate text-sm font-semibold tracking-wide uppercase sm:text-lg">
          {APP_NAME}
        </Link>
        <div className="ms-auto flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 sm:px-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#902d30]">
            {initials(user?.name)}
          </span>
          <span className="hidden max-w-40 truncate text-xs font-medium sm:inline">{user?.name}</span>
        </div>
      </div>

      <div className="flex h-10 items-center bg-[#f9c000] pr-3 pl-28 sm:pr-6 sm:pl-36">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onMenu}
              className="text-gray-900 md:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="truncate text-sm font-semibold text-gray-900 sm:text-base">{moduleName}</span>
          </div>
          <button
            type="button"
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
            className="rounded-full p-1.5 text-gray-800 hover:bg-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              {isFullScreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9H5V5m10 0h4v4M9 15H5v4m10 0h4v-4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M15 4h5v5M4 15v5h5m11-5v5h-5" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
