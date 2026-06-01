import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function SlidePanel({ open, onClose, title, subtitle, children, width = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  }[width] || 'sm:max-w-md'

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-inverse-surface/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed right-0 top-0 h-full z-50 w-full bg-surface-container-lowest shadow-xl',
          'flex flex-col transform transition-transform duration-300 ease-in-out',
          maxWidthClass,
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between p-6 bg-surface-container flex-shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-base font-bold text-on-surface tracking-editorial truncate">{title}</h2>
            {subtitle && <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  )
}
