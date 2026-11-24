import type { RegisterData } from '../auth/AuthContext'
import { performRequest } from '../lib/api'
import type { AuthResponse, User } from '../types'

export function login(email: string, password: string) {
  return performRequest<AuthResponse>('post', '/login', { email, password })
}

export function register(payload: RegisterData) {
  return performRequest<AuthResponse>('post', '/register', payload)
}

export function getProfile() {
  return performRequest<User>('get', '/me')
}

export function logout() {
  return performRequest('post', '/logout')
}
