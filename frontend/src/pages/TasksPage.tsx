import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Table, type ColumnType } from '../components/Table'
import { getErrorMessage, performRequest } from '../lib/api'
import type { Paginated, Task } from '../types'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: 15, total: 0 })
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(
    (page: number) =>
      performRequest<Paginated<Task>>('get', '/tasks', { page })
        .then((res) => {
          setTasks(res.data)
          setMeta(res.meta)
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    loadTasks(1)
  }, [loadTasks])

  const fetchTasks = (page: number) => {
    setLoading(true)
    loadTasks(page)
  }

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await performRequest('post', '/tasks', { title })
      setTitle('')
      fetchTasks(1)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      const { data } = await performRequest<{ data: Task }>('patch', `/tasks/${task.id}`, {
        completed: !task.completed,
      })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const deleteTask = async (task: Task) => {
    try {
      await performRequest('delete', `/tasks/${task.id}`)
      const isLastOnPage = tasks.length === 1 && meta.current_page > 1
      fetchTasks(isLastOnPage ? meta.current_page - 1 : meta.current_page)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns: ColumnType<Task>[] = [
    {
      title: 'Done',
      dataIndex: 'completed',
      width: 70,
      align: 'center',
      render: (_, task) => (
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task)}
          className="h-4 w-4"
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: true,
      render: (value: string, task) => (
        <span className={task.completed ? 'text-gray-400 line-through' : ''}>{value}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      sorter: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, task) => (
        <button onClick={() => deleteTask(task)} className="text-red-600 hover:underline">
          Delete
        </button>
      ),
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>

      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded-md bg-white px-3 py-2 text-sm shadow-md outline-none transition-shadow focus:shadow-lg focus:ring-2 focus:ring-indigo-100"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Add
        </button>
      </form>

      {error && <p className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        emptyText="No tasks yet."
        pagination={{
          current: meta.current_page,
          pageSize: meta.per_page,
          total: meta.total,
          onChange: (page) => fetchTasks(page),
        }}
      />
    </div>
  )
}
