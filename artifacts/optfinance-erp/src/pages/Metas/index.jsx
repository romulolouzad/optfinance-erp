import PageHeader from '../../components/shared/PageHeader'
import { Target, TrendingUp } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const metas = [
  { label: 'Receita Bruta 2026', meta: 900000, realizado: 456000, unidade: 'BRL' },
  { label: 'Novos Contratos', meta: 8, realizado: 5, unidade: 'qtd' },
  { label: 'Margem Líquida', meta: 35, realizado: 28.4, unidade: 'pct' },
  { label: 'NPS Clientes', meta: 80, realizado: 74, unidade: 'pts' },
  { label: 'Redução de Inadimplência', meta: 2, realizado: 2.8, unidade: 'pct', inverso: true },
  { label: 'Contratos Recorrentes', meta: 6, realizado: 4, unidade: 'qtd' },
]

function ProgressBar({ pct, ok }) {
  return (
    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${ok ? 'bg-green-500' : pct >= 80 ? 'bg-primary-container' : 'bg-error'}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

export default function MetasPage() {
  return (
    <div>
      <PageHeader title="Metas & OKRs" subtitle="Acompanhamento de metas estratégicas 2026" />
      <div className="space-y-4">
        {metas.map((m, i) => {
          const pct = m.inverso
            ? m.realizado <= m.meta ? 100 : (m.meta / m.realizado) * 100
            : (m.realizado / m.meta) * 100
          const ok = pct >= 100
          const fmt2 = v => m.unidade === 'BRL' ? fmt(v) : m.unidade === 'pct' ? `${v}%` : `${v} ${m.unidade}`

          return (
            <div key={i} className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${ok ? 'text-green-600' : 'text-primary-container'}`} />
                  <span className="text-sm font-bold text-on-surface">{m.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${ok ? 'text-green-600' : pct < 80 ? 'text-error' : 'text-primary-container'}`}>
                    {fmt2(m.realizado)}
                  </span>
                  <span className="text-text-muted text-xs"> / {fmt2(m.meta)}</span>
                </div>
              </div>
              <ProgressBar pct={pct} ok={ok} />
              <p className="text-xs text-text-muted mt-2">{pct.toFixed(1)}% da meta {m.inverso ? 'máxima' : ''}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
