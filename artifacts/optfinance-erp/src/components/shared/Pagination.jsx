import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
      <span>
        Exibindo <strong className="text-on-surface">{from}–{to}</strong> de{' '}
        <strong className="text-on-surface">{totalItems}</strong> registros
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page === 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-surface-container text-on-surface'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors',
                  p === page
                    ? 'bg-primary-container text-on-primary'
                    : 'hover:bg-surface-container text-on-surface'
                )}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page === totalPages
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-surface-container text-on-surface'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
