import { AlertCircle } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-error">
      <AlertCircle className="w-10 h-10 mb-3 opacity-80" />
      <p className="text-sm font-semibold">{message || 'Ocorreu um erro inesperado'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-semibold text-primary-container hover:underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
