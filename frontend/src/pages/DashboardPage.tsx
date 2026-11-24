import { useEffect, useState } from 'react'
import { getErrorMessage, performRequest } from '../lib/api'
import type { Paginated, Task } from '../types'

interface Stats {
  total: number
  completed: number
  open: number
}

const cards: { key: keyof Stats; label: string }[] = [
  { key: 'total', label: 'Total tasks' },
  { key: 'completed', label: 'Completed' },
  { key: 'open', label: 'Open' },
]

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    performRequest<Paginated<Task>>('get', '/tasks', { per_page: 100 })
      .then((res) => {
        const completed = res.data.filter((task) => task.completed).length
        setStats({ total: res.meta.total, completed, open: res.meta.total - completed })
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {error && <p className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-maroon">
              {stats ? stats[card.key] : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
