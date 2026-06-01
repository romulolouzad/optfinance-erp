import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { cn } from '../../utils/cn'
import { useCentroCusto } from '../../context/CentroCustoContext'
import {
  LayoutDashboard, CandlestickChart, ShoppingCart, Receipt, Users, UserCircle,
  Truck, FileText, BarChart3, TrendingUp, Target, MinusCircle, Landmark,
  BriefcaseBusiness, FileSpreadsheet, History, Settings, ChevronDown,
  Building2, CreditCard, Layers
} from 'lucide-react'

const NAV = [
  {
    section: 'Principal',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Fluxo de Caixa', href: '/fluxo-de-caixa', icon: CandlestickChart },
    ]
  },
  {
    section: 'Receitas',
    items: [
      { label: 'Vendas', href: '/vendas', icon: ShoppingCart },
      { label: 'Parcelas', href: '/parcelas', icon: Layers },
      { label: 'Comissões', href: '/comissoes', icon: TrendingUp },
      { label: 'Notas Fiscais', href: '/notas-fiscais', icon: FileText },
    ]
  },
  {
    section: 'Cadastros',
    items: [
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Colaboradores', href: '/colaboradores', icon: UserCircle },
      { label: 'Fornecedores', href: '/fornecedores', icon: Truck },
    ]
  },
  {
    section: 'Despesas',
    items: [
      { label: 'Despesas', href: '/despesas', icon: MinusCircle },
      { label: 'Empréstimos', href: '/emprestimos', icon: BriefcaseBusiness },
      { label: 'Contas Financeiras', href: '/contas-financeiras', icon: Landmark },
      { label: 'Cartões', href: '/contas-financeiras', icon: CreditCard },
    ]
  },
  {
    section: 'Relatórios',
    items: [
      { label: 'DRE', href: '/dre', icon: BarChart3 },
      { label: 'Budget', href: '/budget', icon: FileSpreadsheet },
      { label: 'Forecast', href: '/forecast', icon: TrendingUp },
      { label: 'Metas', href: '/metas', icon: Target },
      { label: 'Relatórios', href: '/relatorios', icon: Receipt },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { label: 'Histórico', href: '/historico', icon: History },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  }
]

export default function Sidebar({ collapsed, onToggle }) {
  const [location] = useLocation()
  const { centros, centroCustoAtivo, setCentroCustoAtivo } = useCentroCusto()
  const [ccOpen, setCcOpen] = useState(false)

  const isActive = (href) => href === '/' ? location === '/' : location.startsWith(href)

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-inverse-surface transition-all duration-200 ease-in-out flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center h-16 px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4.5 h-4.5 text-on-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-inverse-on-surface leading-none tracking-editorial truncate">
                OptFinance
              </p>
              <p className="text-[10px] text-inverse-primary font-semibold uppercase tracking-label truncate">
                ERP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Centro de Custo Selector */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setCcOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-xs text-inverse-primary font-semibold truncate">
              {centroCustoAtivo
                ? centros.find(c => c.id === centroCustoAtivo)?.nome || 'Todos os centros'
                : 'Todos os centros'}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-inverse-primary flex-shrink-0 transition-transform', ccOpen && 'rotate-180')} />
          </button>
          {ccOpen && (
            <div className="mt-1 py-1 rounded-lg bg-inverse-surface border border-white/10 overflow-hidden">
              <button
                onClick={() => { setCentroCustoAtivo(null); setCcOpen(false) }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs transition-colors',
                  !centroCustoAtivo ? 'text-primary-container font-semibold' : 'text-inverse-on-surface hover:bg-white/5'
                )}
              >
                Todos os centros
              </button>
              {centros.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCentroCustoAtivo(c.id); setCcOpen(false) }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs transition-colors',
                    centroCustoAtivo === c.id ? 'text-primary-container font-semibold' : 'text-inverse-on-surface hover:bg-white/5'
                  )}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-label text-inverse-primary opacity-50">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link key={item.href + item.label} href={item.href}>
                    <a
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-white/10 text-inverse-on-surface sidebar-item-active'
                          : 'text-inverse-on-surface/60 hover:bg-white/5 hover:text-inverse-on-surface'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-primary-container')} />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </a>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/5 transition-colors text-inverse-on-surface/50 hover:text-inverse-on-surface"
        >
          <span className="text-xs">{collapsed ? '▶' : '◀'}</span>
        </button>
      </div>
    </aside>
  )
}
