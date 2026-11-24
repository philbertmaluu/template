import { useEffect, useState, type ReactNode } from 'react'
import { api, tokenStorage } from '../lib/api'
import type { AuthResponse, User } from '../types'
import { AuthContext, type RegisterData } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null)

  useEffect(() => {
    if (!tokenStorage.get()) return

    api
      .get<{ data: User }>('/me')
      .then(({ data }) => setUser(data.data))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = ({ user, token }: AuthResponse) => {
    tokenStorage.set(token)
    setUser(user)
  }

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/login', { email, password })
    handleAuth(data)
  }

  const register = async (payload: RegisterData) => {
    const { data } = await api.post<AuthResponse>('/register', payload)
    handleAuth(data)
  }

  const logout = async () => {
    try {
      await api.post('/logout')
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
