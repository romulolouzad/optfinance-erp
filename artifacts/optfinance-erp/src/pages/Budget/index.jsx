import PageHeader from '../../components/shared/PageHeader'
import { despesas } from '../../data/index'
import { FileSpreadsheet } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const budgets = [
  { categoria: 'Salários', orcado: 350000, realizado: 277200, mes: 5 },
  { categoria: 'Fixo (Aluguel + Energia)', orcado: 90000, realizado: 62500, mes: 5 },
  { categoria: 'Infraestrutura / TI', orcado: 80000, realizado: 58880, mes: 5 },
  { categoria: 'Marketing', orcado: 60000, realizado: 38820, mes: 5 },
  { categoria: 'Suprimentos', orcado: 12000, realizado: 4600, mes: 5 },
  { categoria: 'Manutenção', orcado: 15000, realizado: 7250, mes: 5 },
]

export default function BudgetPage() {
  const totalOrcado = budgets.reduce((s, b) => s + b.orcado, 0)
  const totalRealizado = budgets.reduce((s, b) => s + b.realizado, 0)

  return (
    <div>
      <PageHeader title="Budget Anual 2026" subtitle="Orçamento vs Realizado — acumulado até Maio/2026" />
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary-container" />
          <h3 className="text-sm font-bold text-on-surface">Comparativo Orçado × Realizado</h3>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-label text-text-muted bg-surface-container">
            <span className="col-span-2">Categoria</span>
            <span className="text-right">Orçado (Anual)</span>
            <span className="text-right">Realizado (Jan-Mai)</span>
            <span className="text-right">Saldo</span>
          </div>
          {budgets.map(b => {
            const saldo = b.orcado - b.realizado
            const pct = (b.realizado / b.orcado) * 100
            return (
              <div key={b.categoria} className="grid grid-cols-5 gap-4 px-6 py-4 border-t border-surface-container hover:bg-row-hover transition-colors">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-on-surface">{b.categoria}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 90 ? 'bg-error' : pct > 70 ? 'bg-primary-container' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-right font-medium text-text-muted self-center">{fmt(b.orcado)}</span>
                <span className="text-sm text-right font-semibold text-on-surface self-center">{fmt(b.realizado)}</span>
                <span className={`text-sm text-right font-bold self-center ${saldo >= 0 ? 'text-green-700' : 'text-error'}`}>{fmt(saldo)}</span>
              </div>
            )
          })}
          <div className="grid grid-cols-5 gap-4 px-6 py-4 border-t border-surface-container bg-surface-container font-bold">
            <span className="col-span-2 text-sm text-on-surface">TOTAL</span>
            <span className="text-sm text-right text-on-surface">{fmt(totalOrcado)}</span>
            <span className="text-sm text-right text-on-surface">{fmt(totalRealizado)}</span>
            <span className={`text-sm text-right ${totalOrcado - totalRealizado >= 0 ? 'text-green-700' : 'text-error'}`}>{fmt(totalOrcado - totalRealizado)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
