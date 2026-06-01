import PageHeader from '../../components/shared/PageHeader'
import { BarChart3, FileText, PieChart, TrendingUp, Download } from 'lucide-react'
import { Link } from 'wouter'

const relatorios = [
  { titulo: 'DRE — Demonstrativo de Resultado', descricao: 'Resultado financeiro acumulado do período selecionado.', icon: BarChart3, href: '/dre', color: '#006398' },
  { titulo: 'Fluxo de Caixa Detalhado', descricao: 'Movimentações de entrada e saída com filtros avançados.', icon: TrendingUp, href: '/fluxo-de-caixa', color: '#2E7D32' },
  { titulo: 'Budget vs Realizado', descricao: 'Comparativo entre orçamento planejado e gastos efetivos.', icon: PieChart, href: '/budget', color: '#F97316' },
  { titulo: 'Inadimplência Detalhada', descricao: 'Análise de parcelas vencidas por cliente e período.', icon: FileText, href: '/parcelas', color: '#C62828' },
  { titulo: 'Comissões por Vendedor', descricao: 'Apuração de comissões por contrato e representante.', icon: TrendingUp, href: '/comissoes', color: '#9D4300' },
  { titulo: 'Evolução de Despesas', descricao: 'Gráfico de evolução de despesas por categoria e período.', icon: BarChart3, href: '/despesas', color: '#575E70' },
]

export default function RelatoriosPage() {
  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Acesso rápido aos principais relatórios financeiros" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((r) => {
          const Icon = r.icon
          return (
            <Link key={r.href + r.titulo} href={r.href}>
              <a className="block p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${r.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary-container transition-colors">{r.titulo}</p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{r.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-primary-container">
                  <Download className="w-3.5 h-3.5" />
                  Acessar relatório
                </div>
              </a>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
