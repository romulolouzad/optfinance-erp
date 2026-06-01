import { cn } from '../../utils/cn'

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h1 className="text-xl font-bold text-on-surface tracking-editorial">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
