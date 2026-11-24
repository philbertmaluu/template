import { performRequest } from '../lib/api'
import type { Paginated, Task } from '../types'

export interface TaskInput {
  title: string
  description?: string
  completed?: boolean
}

export function getTasks(params?: { page?: number; per_page?: number }) {
  return performRequest<Paginated<Task>>('get', '/tasks', params)
}

export function createTask(values: TaskInput) {
  return performRequest<Task>('post', '/tasks', values)
}

export function updateTask(id: number, values: Partial<TaskInput>) {
  return performRequest<Task>('patch', `/tasks/${id}`, values)
}

export function deleteTask(id: number) {
  return performRequest('delete', `/tasks/${id}`)
}
