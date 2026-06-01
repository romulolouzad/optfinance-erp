import { Bell, Settings, Search, Menu, Plus, FlaskConical, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/AuthContext'
import { useCentroCusto } from '../../context/CentroCustoContext'
import { cn } from '../../utils/cn'

const DEV_PROFILES = [
  { value: 'admin',       label: 'Admin' },
  { value: 'financeiro',  label: 'Financeiro' },
  { value: 'visualizacao', label: 'Visualização' },
]

const QUICK_CREATE = [
  { label: 'Nova Venda', href: '/vendas' },
  { label: 'Nova Despesa', href: '/despesas' },
  { label: 'Novo Cliente', href: '/clientes' },
]

export default function Topbar({ onMenuToggle }) {
  const { usuario, perfil, setPerfil } = useAuth()
  const { centros, centroCustoAtivo, setCentroCustoAtivo } = useCentroCusto()
  const [createOpen, setCreateOpen] = useState(false)
  const [notifCount] = useState(3)

  const initials = usuario
    ? (() => {
        const parts = (usuario.usuario || '').trim().split(' ')
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      })()
    : 'OP'

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-surface flex-shrink-0 border-b border-[#E0C0B1]/20">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors text-text-muted"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global search */}
      <div className="relative hidden sm:flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Pesquisar no sistema..."
          className={cn(
            'pl-9 pr-4 py-1.5 text-sm rounded-lg w-56 lg:w-72',
            'bg-surface-container-lowest text-on-surface placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-container/30',
            'transition-all'
          )}
        />
      </div>

      <div className="flex-1" />

      {/* Centro de custo selector */}
      <div className="hidden md:flex items-center">
        <select
          value={centroCustoAtivo ?? ''}
          onChange={e => setCentroCustoAtivo(e.target.value || null)}
          className={cn(
            'text-xs font-medium rounded-lg px-3 py-1.5 pr-7 appearance-none',
            'bg-surface-container text-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary-container/30',
            'cursor-pointer'
          )}
        >
          <option value="">Todos os centros</option>
          {centros.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Create New */}
      <div className="relative">
        <button
          onClick={() => setCreateOpen(o => !o)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white',
            'transition-all hover:brightness-110 active:scale-[0.98]'
          )}
          style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create New</span>
        </button>

        {createOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setCreateOpen(false)} />
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-surface-container-lowest z-20 py-1 overflow-hidden"
              style={{ boxShadow: '0 8px 24px -4px rgba(157,67,0,0.15), 0 2px 8px -2px rgba(157,67,0,0.08)' }}>
              {QUICK_CREATE.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCreateOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-primary-container" />
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-surface-container transition-colors text-text-muted">
        <Bell className="w-4 h-4" />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F97316] flex items-center justify-center text-[9px] font-bold text-white leading-none">
            {notifCount}
          </span>
        )}
      </button>

      {/* Settings */}
      <button className="p-2 rounded-lg hover:bg-surface-container transition-colors text-text-muted">
        <Settings className="w-4 h-4" />
      </button>

      {/* Dev profile switcher */}
      {import.meta.env.DEV && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-container/10 border border-primary-container/20">
          <FlaskConical className="w-3 h-3 text-primary-container flex-shrink-0" />
          <select
            value={perfil}
            onChange={e => setPerfil(e.target.value)}
            className="text-xs font-semibold text-primary-container bg-transparent focus:outline-none cursor-pointer"
            title="Perfil de teste (DEV only)"
          >
            {DEV_PROFILES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* User avatar */}
      <div className="flex items-center gap-2 pl-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
        >
          {initials}
        </div>
        {usuario && (
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-none">{usuario.usuario}</p>
            <p className="text-[10px] text-text-muted leading-none mt-0.5">{usuario.cargo}</p>
          </div>
        )}
      </div>
    </header>
  )
}
