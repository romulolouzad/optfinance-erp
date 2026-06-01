import { Link, useLocation } from 'wouter'
import { cn } from '../../utils/cn'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ShoppingCart, CreditCard, Percent, Users,
  UserCheck, Truck, FileText, BarChart2, TrendingUp, Target,
  Activity, Landmark, Building2, PieChart, BookOpen, Clock,
  Settings, HelpCircle, LogOut
} from 'lucide-react'

const NAV_GROUPS = [
  {
    section: null,
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard, recurso: 'dashboard' },
    ]
  },
  {
    section: 'COMERCIAL',
    items: [
      { label: 'Vendas & Contratos', href: '/vendas', icon: ShoppingCart, recurso: 'vendas' },
      { label: 'Parcelas', href: '/parcelas', icon: CreditCard, recurso: 'parcelas' },
      { label: 'Comissões', href: '/comissoes', icon: Percent, recurso: 'comissoes' },
      { label: 'Clientes', href: '/clientes', icon: Users, recurso: 'clientes' },
    ]
  },
  {
    section: 'OPERACIONAL',
    items: [
      { label: 'Colaboradores', href: '/colaboradores', icon: UserCheck, recurso: 'colaboradores' },
      { label: 'Fornecedores', href: '/fornecedores', icon: Truck, recurso: 'fornecedores' },
      { label: 'Notas Fiscais', href: '/notas-fiscais', icon: FileText, recurso: 'notas-fiscais' },
    ]
  },
  {
    section: 'FINANCEIRO',
    items: [
      { label: 'DRE', href: '/dre', icon: BarChart2, recurso: 'dre' },
      { label: 'Forecast', href: '/forecast', icon: TrendingUp, recurso: 'forecast' },
      { label: 'Metas', href: '/metas', icon: Target, recurso: 'metas' },
      { label: 'Fluxo de Caixa', href: '/fluxo-de-caixa', icon: Activity, recurso: 'fluxo-de-caixa' },
      { label: 'Despesas', href: '/despesas', icon: Landmark, recurso: 'despesas' },
      { label: 'Empréstimos', href: '/emprestimos', icon: Landmark, recurso: 'emprestimos' },
      { label: 'Contas Financeiras', href: '/contas-financeiras', icon: Building2, recurso: 'contas-financeiras' },
    ]
  },
  {
    section: 'SISTEMA',
    items: [
      { label: 'Relatórios', href: '/relatorios', icon: PieChart, recurso: 'relatorios' },
      { label: 'Budget', href: '/budget', icon: BookOpen, recurso: 'budget' },
      { label: 'Histórico', href: '/historico', icon: Clock, recurso: 'historico' },
      { label: 'Configurações', href: '/configuracoes', icon: Settings, recurso: 'configuracoes' },
    ]
  },
]

function getInitials(name) {
  if (!name) return 'OP'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Sidebar({ open, onClose }) {
  const [location] = useLocation()
  const { usuario, perfil, logout } = useAuth()

  const isActive = (href) =>
    href === '/' ? location === '/' : location.startsWith(href)

  const displayName = usuario?.usuario || 'Admin User'
  const displayCargo = usuario?.cargo || 'Finance Director'
  const initials = getInitials(displayName)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'bg-[#111827] w-[220px] transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none tracking-tight">
              Optsolv ERP
            </p>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 leading-none">
              ENTERPRISE RESOURCE PLANNING
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={group.section ? 'mt-2' : ''}>
              {group.section && (
                <p className="text-[10px] text-gray-500 uppercase tracking-widest px-4 mt-4 mb-1 font-semibold">
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'relative flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors',
                        active
                          ? 'bg-white/5 text-white font-semibold pl-[calc(1rem-4px)] pr-3 border-l-4 border-[#F97316]'
                          : 'text-gray-400 hover:text-white hover:bg-white/10 px-4'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[#F97316]' : '')} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex-shrink-0 space-y-2">
          {/* User card */}
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-none">{displayCargo}</p>
              <p className="text-[9px] text-[#FFB690] uppercase tracking-widest mt-0.5 leading-none font-semibold">{perfil}</p>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <a
              href="#support"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Support
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
