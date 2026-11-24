import { Input, Table } from 'antd'
import type { TableProps } from 'antd'
import { useState, type ReactNode } from 'react'

type DataTableProps<T extends object> = Omit<TableProps<T>, 'dataSource' | 'size'> & {
  dataSource: T[]
  searchPlaceholder?: string
  /** Controls on the right of the search row, such as an Add button. */
  extra?: ReactNode
  /** Text searched for each row. Defaults to the row's string and number fields. */
  getSearchText?: (record: T) => string
}

function defaultSearchText(record: object): string {
  return Object.values(record)
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ')
}

/**
 * Standard table for this app: one search box, optional actions at the end, full-width table.
 * Use this for every new table instead of antd `Table` directly.
 */
export function DataTable<T extends object>({
  dataSource,
  searchPlaceholder = 'Search',
  extra,
  getSearchText,
  ...tableProps
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const toText = getSearchText ?? defaultSearchText

  const rows = query
    ? dataSource.filter((record) => toText(record).toLowerCase().includes(query))
    : dataSource

  const { pagination, ...rest } = tableProps
  // While searching, page the filtered rows instead of the server total.
  const activePagination =
    query && pagination && typeof pagination === 'object'
      ? { pageSize: pagination.pageSize ?? 10, total: rows.length }
      : pagination

  return (
    <div className="rounded-xl bg-white p-4 shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          style={{ width: 208 }}
        />
        {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
      </div>

      <Table<T> size="small" dataSource={rows} pagination={activePagination} {...rest} />
    </div>
  )
}
