import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import { vendas, despesas } from '../../data/index'
import { TrendingUp, Target } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ForecastPage() {
  const pipeline = vendas.filter(v => v.situacao === 'projecao').reduce((s, v) => s + v.valorTotal, 0)
  const ativo = vendas.filter(v => v.situacao === 'ativa').reduce((s, v) => s + v.valorTotal, 0)
  const previstoPagar = despesas.filter(d => d.situacao === 'prevista').reduce((s, d) => s + d.valor, 0)

  const cards = [
    { title: 'Pipeline Confirmado', value: ativo, icon: TrendingUp, accent: '#2E7D32', type: 'currency' },
    { title: 'Pipeline Projetado', value: pipeline, icon: Target, accent: '#F57F17', type: 'currency' },
    { title: 'Despesas Previstas', value: previstoPagar, icon: TrendingUp, accent: '#C62828', type: 'currency' },
    { title: 'Saldo Projetado', value: pipeline - previstoPagar, icon: TrendingUp, type: 'currency' },
  ]

  const meses = [
    { mes: 'Jun/26', receita: 42500, despesa: 28400, projecao: 14100 },
    { mes: 'Jul/26', receita: 65000, despesa: 30200, projecao: 34800 },
    { mes: 'Aug/26', receita: 58000, despesa: 29800, projecao: 28200 },
    { mes: 'Set/26', receita: 72000, despesa: 31500, projecao: 40500 },
    { mes: 'Out/26', receita: 80000, despesa: 33000, projecao: 47000 },
    { mes: 'Nov/26', receita: 75000, despesa: 32000, projecao: 43000 },
  ]

  return (
    <div>
      <PageHeader title="Forecast Financeiro" subtitle="Projeção de receitas e despesas para os próximos 6 meses" />
      <SummaryCards cards={cards} />
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container">
          <h3 className="text-sm font-bold text-on-surface">Projeção Mensal — Jun a Nov 2026</h3>
        </div>
        <div className="divide-y divide-surface-container">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-label text-text-muted">
            <span>Mês</span>
            <span className="text-right">Receita Proj.</span>
            <span className="text-right">Despesa Proj.</span>
            <span className="text-right">Resultado</span>
          </div>
          {meses.map(m => (
            <div key={m.mes} className="grid grid-cols-4 gap-4 px-6 py-3 hover:bg-row-hover transition-colors">
              <span className="text-sm font-semibold text-on-surface">{m.mes}</span>
              <span className="text-sm text-right text-green-700 font-semibold">{fmt(m.receita)}</span>
              <span className="text-sm text-right text-error font-semibold">{fmt(m.despesa)}</span>
              <span className={`text-sm text-right font-bold ${m.projecao > 0 ? 'text-green-700' : 'text-error'}`}>{fmt(m.projecao)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
