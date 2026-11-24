export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

/** Laravel's paginator JSON: the rows are in `data`, the page info sits next to it. */
export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AuthResponse {
  user: User
  token: string
}
