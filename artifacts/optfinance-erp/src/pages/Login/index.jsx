import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function LoginPage() {
  const { login, autenticado } = useAuth()
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (autenticado) {
    setLocation('/')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !senha) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))
    login(email, senha)
    setLoading(false)
    setLocation('/')
  }

  return (
    <div className="min-h-screen bg-inverse-surface flex items-center justify-center p-6">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-7 h-7 text-on-primary" />
          </div>
          <h1 className="text-2xl font-bold text-inverse-on-surface tracking-editorial">
            OptFinance
          </h1>
          <p className="text-xs text-inverse-primary font-semibold uppercase tracking-label mt-1">
            Enterprise Resource Planning
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 p-8">
          <h2 className="text-base font-bold text-inverse-on-surface mb-1">Acesso ao Sistema</h2>
          <p className="text-xs text-inverse-primary mb-6">Entre com suas credenciais corporativas</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-inverse-primary mb-1.5 uppercase tracking-label">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm',
                  'bg-white/10 text-inverse-on-surface placeholder:text-inverse-on-surface/30',
                  'focus:outline-none focus:ring-2 focus:ring-primary-container/60',
                  'transition-shadow'
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-inverse-primary mb-1.5 uppercase tracking-label">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 pr-11 rounded-xl text-sm',
                    'bg-white/10 text-inverse-on-surface placeholder:text-inverse-on-surface/30',
                    'focus:outline-none focus:ring-2 focus:ring-primary-container/60',
                    'transition-shadow'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inverse-on-surface/40 hover:text-inverse-on-surface/80 transition-colors"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-bold text-on-primary transition-all',
                'bg-primary-container hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-container/60',
                loading && 'opacity-60 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-inverse-on-surface/20 mt-6">
          © 2026 OptFinance ERP — Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
