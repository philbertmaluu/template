import { useMemo, useState, type HTMLAttributes, type Key, type ReactNode } from 'react'

export interface ColumnType<T> {
  title: ReactNode
  /** Field of the record to display. Supports nested paths like "user.name". */
  dataIndex?: string
  key?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, index: number) => ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
  /** `true` sorts by dataIndex; a function works like Array.sort's compare. Sorting is client-side. */
  sorter?: boolean | ((a: T, b: T) => number)
  className?: string
}

export interface TablePagination {
  current?: number
  pageSize?: number
  /** Set this for server-side pagination; otherwise dataSource is paginated in the browser. */
  total?: number
  onChange?: (page: number, pageSize: number) => void
}

export interface TableProps<T> {
  columns: ColumnType<T>[]
  dataSource: T[]
  rowKey?: string | ((record: T) => Key)
  loading?: boolean
  pagination?: TablePagination | false
  emptyText?: ReactNode
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>
  title?: () => ReactNode
}

type SortOrder = 'asc' | 'desc' | null

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

function getValue(record: unknown, path?: string): unknown {
  if (!path) return undefined
  return path
    .split('.')
    .reduce<unknown>((obj, key) => (obj as Record<string, unknown> | undefined)?.[key], record)
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null) return b == null ? 0 : -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

function pageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < last - 1) pages.push('...')
  pages.push(last)
  return pages
}

export function Table<T>({
  columns,
  dataSource,
  rowKey = 'id',
  loading = false,
  pagination = {},
  emptyText = 'No data',
  onRow,
  title,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ index: number; order: SortOrder }>({ index: -1, order: null })
  const [innerPage, setInnerPage] = useState(1)

  const pageSize = (pagination && pagination.pageSize) || 10
  const isServerSide = pagination !== false && pagination.total !== undefined
  const current = (pagination && pagination.current) || innerPage
  const total = isServerSide ? pagination.total! : dataSource.length
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  const sorted = useMemo(() => {
    const column = columns[sort.index]
    if (!column?.sorter || !sort.order) return dataSource
    const compare =
      typeof column.sorter === 'function'
        ? column.sorter
        : (a: T, b: T) => defaultCompare(getValue(a, column.dataIndex), getValue(b, column.dataIndex))
    const result = [...dataSource].sort(compare)
    return sort.order === 'desc' ? result.reverse() : result
  }, [dataSource, columns, sort])

  const rows =
    pagination === false || isServerSide
      ? sorted
      : sorted.slice((current - 1) * pageSize, current * pageSize)

  const getKey = (record: T, index: number): Key =>
    typeof rowKey === 'function'
      ? rowKey(record)
      : ((getValue(record, rowKey) as Key | undefined) ?? index)

  const toggleSort = (index: number) => {
    setSort((prev) => {
      if (prev.index !== index) return { index, order: 'asc' }
      const next: SortOrder = prev.order === 'asc' ? 'desc' : prev.order === 'desc' ? null : 'asc'
      return { index, order: next }
    })
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage || page === current) return
    if (pagination && pagination.current === undefined) setInnerPage(page)
    if (pagination) pagination.onChange?.(page, pageSize)
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      {title && <div className="px-4 py-3 font-semibold">{title()}</div>}

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
            <tr>
              {columns.map((column, i) => {
                const active = sort.index === i ? sort.order : null
                return (
                  <th
                    key={column.key ?? column.dataIndex ?? i}
                    style={{ width: column.width }}
                    className={`px-4 py-3 font-medium ${alignClass[column.align ?? 'left']} ${
                      column.sorter ? 'cursor-pointer select-none hover:text-gray-900' : ''
                    }`}
                    onClick={column.sorter ? () => toggleSort(i) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.title}
                      {column.sorter && (
                        <span className="flex flex-col text-[8px] leading-[8px]">
                          <span className={active === 'asc' ? 'text-gray-900' : 'text-gray-300'}>▲</span>
                          <span className={active === 'desc' ? 'text-gray-900' : 'text-gray-300'}>▼</span>
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  {loading ? '' : emptyText}
                </td>
              </tr>
            ) : (
              rows.map((record, rowIndex) => {
                const rowProps = onRow?.(record, rowIndex) ?? {}
                return (
                  <tr
                    key={getKey(record, rowIndex)}
                    {...rowProps}
                    className={`transition-colors even:bg-gray-50/60 hover:bg-gray-100/70 ${rowProps.className ?? ''}`}
                  >
                    {columns.map((column, colIndex) => {
                      const value = getValue(record, column.dataIndex)
                      return (
                        <td
                          key={column.key ?? column.dataIndex ?? colIndex}
                          className={`px-4 py-3 ${alignClass[column.align ?? 'left']} ${column.className ?? ''}`}
                        >
                          {column.render
                            ? column.render(value, record, rowIndex)
                            : (value as ReactNode)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          </div>
        )}
      </div>

      {pagination !== false && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-gray-600">
          <span>
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <PageButton disabled={current === 1} onClick={() => goToPage(current - 1)}>
              ‹
            </PageButton>
            {pageNumbers(current, lastPage).map((page, i) =>
              page === '...' ? (
                <span key={`gap-${i}`} className="px-2 text-gray-400">
                  …
                </span>
              ) : (
                <PageButton key={page} active={page === current} onClick={() => goToPage(page)}>
                  {page}
                </PageButton>
              ),
            )}
            <PageButton disabled={current === lastPage} onClick={() => goToPage(current + 1)}>
              ›
            </PageButton>
          </div>
        </div>
      )}
    </div>
  )
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-8 rounded-md px-2 py-1 transition ${
        active ? 'bg-maroon text-white shadow-md' : 'hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent'
      }`}
    >
      {children}
    </button>
  )
}
