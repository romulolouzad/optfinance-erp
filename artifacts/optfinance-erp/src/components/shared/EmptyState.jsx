import { Inbox } from 'lucide-react'

export default function EmptyState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <Inbox className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm font-semibold">Nenhum registro encontrado</p>
      {message && <p className="text-xs mt-1 opacity-70">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
