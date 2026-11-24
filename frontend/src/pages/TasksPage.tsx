import { useEffect, useState, type FormEvent } from 'react'
import { api, getErrorMessage } from '../lib/api'
import type { Paginated, Task } from '../types'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<Paginated<Task>>('/tasks')
      .then(({ data }) => setTasks(data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const { data } = await api.post<{ data: Task }>('/tasks', { title })
      setTasks((prev) => [data.data, ...prev])
      setTitle('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      const { data } = await api.patch<{ data: Task }>(`/tasks/${task.id}`, {
        completed: !task.completed,
      })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data.data : t)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const deleteTask = async (task: Task) => {
    try {
      await api.delete(`/tasks/${task.id}`)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>

      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Add
        </button>
      </form>

      {error && <p className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                className="h-4 w-4"
              />
              <span className={`flex-1 ${task.completed ? 'text-gray-400 line-through' : ''}`}>
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
