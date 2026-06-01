import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function FilterBar({ search, onSearchChange, filters, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 mb-4', className)}>
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
        </div>
      )}
      {filters && filters.map((filter, idx) => (
        <div key={idx} className="relative">
          <select
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className={cn(
              'appearance-none pl-3 pr-8 py-2 text-sm rounded-lg bg-surface-container-low',
              'text-on-surface',
              'focus:outline-none focus:ring-2 focus:ring-primary-container/40',
              'cursor-pointer'
            )}
          >
            <option value="">{filter.placeholder || filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
        </div>
      ))}
    </div>
  )
}
