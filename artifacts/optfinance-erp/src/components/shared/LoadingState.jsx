export default function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">{message || 'Carregando...'}</p>
    </div>
  )
}
