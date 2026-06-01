import { Lock } from 'lucide-react'
import { Link } from 'wouter'

export default function NoPermissionState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <Lock className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm font-semibold">Sem permissão de acesso</p>
      <p className="text-xs mt-1 opacity-70 text-center max-w-xs">
        {message || 'Você não tem permissão para acessar este recurso. Contate o administrador.'}
      </p>
      <Link href="/">
        <a className="mt-4 text-xs font-semibold text-primary-container hover:underline">
          Voltar ao Dashboard
        </a>
      </Link>
    </div>
  )
}
