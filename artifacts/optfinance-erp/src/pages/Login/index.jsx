import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Building2, Mail, Lock, X } from 'lucide-react'
import { cn } from '../../utils/cn'

function Toast({ message, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-surface-container-lowest shadow-xl max-w-sm animate-in slide-in-from-right-4">
      <div className="w-1.5 self-stretch rounded-full bg-primary-container flex-shrink-0" />
      <p className="text-sm text-on-surface font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-text-muted hover:text-on-surface transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function LoginPage() {
  const { login, autenticado } = useAuth()
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [manterConectado, setManterConectado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

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

  function handleEsqueci(e) {
    e.preventDefault()
    if (!email) {
      setError('Insira seu e-mail para recuperar a senha.')
      return
    }
    setToast(`Link de recuperação enviado para ${email}`)
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div className="min-h-screen bg-inverse-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Fixed top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-primary-fixed-dim" />

      {/* Background grid overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-inverse-on-surface tracking-editorial">
            Optsolv ERP
          </h1>
          <p className="text-xs text-inverse-primary font-semibold uppercase tracking-label mt-1">
            Financial Enterprise Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          {/* Card header strip */}
          <div className="h-0.5 bg-gradient-to-r from-primary to-primary-container" />

          <div className="bg-white/[0.06] p-8">
            <h2 className="text-base font-bold text-inverse-on-surface mb-1">Acesso ao Sistema</h2>
            <p className="text-xs text-inverse-primary mb-6">Entre com suas credenciais corporativas</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail field */}
              <div>
                <label className="block text-xs font-semibold text-inverse-primary mb-1.5 uppercase tracking-label">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-inverse-primary/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@empresa.com.br"
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl text-sm',
                      'bg-white/[0.08] text-inverse-on-surface placeholder:text-inverse-on-surface/25',
                      'focus:outline-none focus:ring-2 focus:ring-primary-container/50',
                      'transition-all'
                    )}
                  />
                </div>
              </div>

              {/* Senha field */}
              <div>
                <label className="block text-xs font-semibold text-inverse-primary mb-1.5 uppercase tracking-label">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-inverse-primary/50" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      'w-full pl-10 pr-11 py-3 rounded-xl text-sm',
                      'bg-white/[0.08] text-inverse-on-surface placeholder:text-inverse-on-surface/25',
                      'focus:outline-none focus:ring-2 focus:ring-primary-container/50',
                      'transition-all'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-inverse-on-surface/30 hover:text-inverse-on-surface/70 transition-colors"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Manter conectado + Esqueci a senha */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setManterConectado(v => !v)}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
                      manterConectado ? 'bg-primary-container' : 'bg-white/15'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      manterConectado ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </div>
                  <span className="text-xs text-inverse-on-surface/60 select-none">Manter conectado</span>
                </label>
                <button
                  type="button"
                  onClick={handleEsqueci}
                  className="text-xs text-inverse-primary hover:text-primary-container transition-colors font-semibold"
                >
                  Esqueci minha senha
                </button>
              </div>

              {error && (
                <p className="text-xs text-error bg-error/10 rounded-lg px-3 py-2.5 border border-error/20">
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all mt-2',
                  'focus:outline-none focus:ring-2 focus:ring-primary-container/60',
                  loading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.99]'
                )}
                style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando…
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-inverse-on-surface/20 mt-6">
          © 2026 Optsolv — Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
