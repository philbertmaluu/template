import axios, { type AxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear()
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * Single entry point for API calls. Returns the response body.
 * For "get" and "delete" the payload is sent as query params; otherwise as the request body.
 *
 *   const tasks = await performRequest<Paginated<Task>>('get', '/tasks', { page: 2 })
 *   const { data } = await performRequest<{ data: Task }>('post', '/tasks', { title })
 */
export async function performRequest<T = unknown>(
  method: HttpMethod,
  url: string,
  payload?: unknown,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const sendsBody = method !== 'get' && method !== 'delete'

  const response = await api.request<T>({
    method,
    url,
    ...(sendsBody ? { data: payload } : { params: payload }),
    ...config,
  })

  return response.data
}

/** Laravel validation errors: { message, errors: { field: [msg] } } */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
    return firstFieldError ?? data?.message ?? error.message
  }
  return 'Something went wrong'
}
