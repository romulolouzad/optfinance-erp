import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

export default function DataTable({
  columns,
  data,
  onRowClick,
  keyField = 'id',
  sortable = true,
  className,
  emptyMessage,
  onRetry,
  loading,
  error,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(col) {
    if (!sortable || !col.accessor) return
    if (sortKey === col.accessor) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.accessor)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'pt-BR')
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return (
    <div className={cn('overflow-x-auto rounded-xl bg-surface-container-lowest', className)}
      style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-container">
            {columns.map(col => (
              <th
                key={col.accessor || col.header}
                onClick={() => col.sortable !== false && handleSort(col)}
                className={cn(
                  'text-left px-4 py-3 text-xs font-bold uppercase tracking-label text-text-muted select-none',
                  sortable && col.sortable !== false && col.accessor ? 'cursor-pointer hover:text-on-surface transition-colors' : '',
                  col.align === 'right' ? 'text-right' : '',
                  col.align === 'center' ? 'text-center' : '',
                  col.printHidden ? 'print:hidden' : ''
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortable && col.sortable !== false && col.accessor && (
                    sortKey === col.accessor
                      ? sortDir === 'asc'
                        ? <ChevronUp className="w-3 h-3 text-primary-container" />
                        : <ChevronDown className="w-3 h-3 text-primary-container" />
                      : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <LoadingState />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length}>
                <ErrorState message={error} onRetry={onRetry} />
              </td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState message={emptyMessage} onRetry={onRetry} />
              </td>
            </tr>
          ) : (
            sorted.map((row, rowIdx) => (
              <tr
                key={row[keyField] ?? rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors',
                  rowIdx % 2 === 1 ? 'bg-surface-container-low/40' : 'bg-surface-container-lowest',
                  onRowClick ? 'cursor-pointer hover:bg-row-hover' : 'hover:bg-surface-container-low'
                )}
              >
                {columns.map(col => (
                  <td
                    key={col.accessor || col.header}
                    className={cn(
                      'px-4 py-3 text-on-surface',
                      col.align === 'right' ? 'text-right' : '',
                      col.align === 'center' ? 'text-center' : '',
                      col.className,
                      col.printHidden ? 'print:hidden' : ''
                    )}
                  >
                    {col.cell ? col.cell(row) : (col.accessor ? row[col.accessor] : null)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
