import { Alert, Button, Checkbox, Input, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
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

  const columns: TableColumnsType<Task> = [
    {
      title: 'Done',
      dataIndex: 'completed',
      width: 80,
      align: 'center',
      render: (_, task) => (
        <Checkbox checked={task.completed} onChange={() => toggleTask(task)} />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (value: string, task) => (
        <span className={task.completed ? 'text-gray-400 line-through' : ''}>{value}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, task) => (
        <Button type="link" danger onClick={() => deleteTask(task)}>
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>

      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          size="large"
        />
        <Button type="primary" htmlType="submit" size="large">
          Add
        </Button>
      </form>

      {error && <Alert type="error" title={error} showIcon className="mb-4" />}

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          locale={{ emptyText: 'No tasks yet.' }}
          pagination={{
            current: meta.current_page,
            pageSize: meta.per_page,
            total: meta.total,
            showSizeChanger: false,
            onChange: (page) => fetchTasks(page),
          }}
        />
      </div>
    </div>
  )
}
