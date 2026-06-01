import { cn } from '../../utils/cn'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function formatValue(value, type) {
  if (type === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
  if (type === 'number') return new Intl.NumberFormat('pt-BR').format(value)
  if (type === 'percent') return `${value.toFixed(1)}%`
  return value
}

export default function SummaryCards({ cards }) {
  return (
    <div
      className="grid gap-4 mb-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, minmax(0, 1fr))` }}
    >
      {cards.map((card, idx) => (
        <SummaryCard key={idx} {...card} />
      ))}
    </div>
  )
}

function SummaryCard({ title, value, type = 'currency', icon: Icon, trend, trendLabel, accent }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-error' : 'text-text-muted'
  const formattedValue = formatValue(value, type)

  return (
    <div
      className={cn(
        'rounded-xl p-5 bg-surface-container-lowest',
        'shadow-sm transition-shadow hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-label text-text-muted">{title}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accent ? `${accent}1A` : '#F9731618' }}
          >
            <Icon className="w-4 h-4" style={{ color: accent || '#F97316' }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-on-surface tracking-editorial truncate">
        {formattedValue}
      </p>
      {trendLabel && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
