import { Bell, LogOut, ChevronDown, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const DEV_PROFILES = [
  { value: 'admin',      label: 'Admin' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial',  label: 'Comercial' },
  { value: 'viewer',     label: 'Viewer (somente leitura)' },
  { value: 'ti',         label: 'TI' },
]

export default function Topbar({ breadcrumb }) {
  const { usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [devPerfil, setDevPerfil] = useState('admin')

  const initials = usuario
    ? usuario.usuario.slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest flex-shrink-0"
      style={{ boxShadow: '0 1px 0 0 rgba(224,192,177,0.25)' }}>
      {/* Breadcrumb */}
      <div>
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 text-xs text-text-muted">
            {breadcrumb.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="opacity-40">/</span>}
                <span className={idx === breadcrumb.length - 1 ? 'text-on-surface font-semibold' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* DEV-only profile switcher */}
        {import.meta.env.DEV && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-container/10 border border-primary-container/20">
            <FlaskConical className="w-3 h-3 text-primary-container flex-shrink-0" />
            <select
              value={devPerfil}
              onChange={e => setDevPerfil(e.target.value)}
              className="text-xs font-semibold text-primary-container bg-transparent focus:outline-none cursor-pointer"
              title="Perfil de teste (DEV only)"
            >
              {DEV_PROFILES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-surface-container transition-colors text-text-muted">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-error" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}>
              {initials}
            </div>
            {usuario && (
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-on-surface leading-none">{usuario.usuario}</p>
                <p className="text-[10px] text-text-muted leading-none mt-0.5">{usuario.cargo}</p>
              </div>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 text-text-muted transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 rounded-xl bg-surface-container-lowest z-20 py-1 overflow-hidden"
                style={{ boxShadow: '0 8px 32px -4px rgba(157,67,0,0.12), 0 2px 8px -2px rgba(157,67,0,0.08)' }}>
                <div className="px-4 py-3 bg-surface-container rounded-t-xl">
                  <p className="text-xs font-bold text-on-surface">{usuario?.usuario}</p>
                  <p className="text-[10px] text-text-muted">{usuario?.email}</p>
                  <p className="text-[10px] text-primary-container font-semibold mt-0.5 uppercase tracking-label">{usuario?.perfil}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
