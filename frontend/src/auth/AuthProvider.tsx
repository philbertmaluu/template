import { useEffect, useState, type ReactNode } from 'react'
import { getProfile, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../hooks/useAuthApi'
import { tokenStorage } from '../lib/api'
import type { AuthResponse, User } from '../types'
import { AuthContext, type RegisterData } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)

  useEffect(() => {
    if (!tokenStorage.get()) return

    getProfile()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = ({ user, token }: AuthResponse) => {
    tokenStorage.set(token)
    setUser(user)
  }

  const login = async (email: string, password: string) => {
    handleAuth(await loginRequest(email, password))
  }

  const register = async (payload: RegisterData) => {
    handleAuth(await registerRequest(payload))
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
