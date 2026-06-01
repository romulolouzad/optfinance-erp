import { Link } from 'wouter'
import { Lock, Home } from 'lucide-react'

export default function SemPermissaoPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">Acesso Negado</h1>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          Você não tem permissão para acessar este recurso.
          Entre em contato com o administrador do sistema.
        </p>
        <Link href="/">
          <a className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-colors">
            <Home className="w-4 h-4" />
            Voltar ao Dashboard
          </a>
        </Link>
      </div>
    </div>
  )
}
