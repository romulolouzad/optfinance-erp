import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

export default function Topbar({ breadcrumb }) {
  const { usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = usuario
    ? usuario.usuario.slice(0, 2).toUpperCase()
    : 'OP'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest shadow-sm flex-shrink-0">
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
            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary">
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
              <div className="absolute right-0 mt-1 w-52 rounded-xl bg-surface-container-lowest shadow-lg z-20 py-1 overflow-hidden">
                <div className="px-4 py-3 bg-surface-container">
                  <p className="text-xs font-bold text-on-surface">{usuario?.usuario}</p>
                  <p className="text-[10px] text-text-muted">{usuario?.email}</p>
                  <p className="text-[10px] text-primary-container font-semibold mt-0.5">{usuario?.perfil}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors"
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
