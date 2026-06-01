import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function FilterBar({ search, onSearchChange, filters, className }) {
  const activeFilters = (filters || []).filter(f => f.value)

  return (
    <div className={cn('mb-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className={cn(
                'w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface-container-low',
                'text-on-surface placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary-container/40',
                'transition-shadow'
              )}
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {filters && filters.map((filter, idx) => (
          <div key={idx} className="relative">
            <select
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 text-sm rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary-container/40 cursor-pointer transition-colors',
                filter.value
                  ? 'bg-primary-container/10 text-primary-container font-semibold'
                  : 'bg-surface-container-low text-on-surface'
              )}
            >
              <option value="">{filter.placeholder || filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: filter.value ? '#F97316' : '#6B7280' }}>▾</span>
          </div>
        ))}
      </div>

      {/* Active filter chips */}
      {(activeFilters.length > 0 || search) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-text-muted font-semibold">Filtros ativos:</span>
          {search && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Search className="w-3 h-3" />
              "{search}"
              <X className="w-3 h-3" />
            </button>
          )}
          {activeFilters.map((filter, idx) => {
            const opt = filter.options.find(o => o.value === filter.value)
            return (
              <button
                key={idx}
                onClick={() => filter.onChange('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-container/10 text-primary-container hover:bg-primary-container/20 transition-colors"
              >
                {opt?.label || filter.value}
                <X className="w-3 h-3" />
              </button>
            )
          })}
          {(activeFilters.length > 1 || (activeFilters.length > 0 && search)) && (
            <button
              onClick={() => {
                if (onSearchChange) onSearchChange('')
                activeFilters.forEach(f => f.onChange(''))
              }}
              className="text-xs text-text-muted hover:text-error transition-colors font-semibold"
            >
              Limpar todos
            </button>
          )}
        </div>
      )}
    </div>
  )
}
