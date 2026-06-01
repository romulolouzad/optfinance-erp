import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import { contasFinanceiras } from '../../data/index'
import { Landmark, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const ICONS = {
  corrente: Landmark,
  poupança: TrendingUp,
  caixa: Landmark,
  cartão: CreditCard,
}

const COLORS = {
  corrente: '#006398',
  poupança: '#2E7D32',
  caixa: '#F97316',
  cartão: '#9D4300',
}

export default function ContasFinanceirasPage() {
  const [selected, setSelected] = useState(null)
  const saldoTotal = contasFinanceiras.reduce((s, c) => s + c.saldoAtual, 0)

  const cards = [
    { title: 'Saldo Consolidado', value: saldoTotal, icon: Landmark, type: 'currency' },
    { title: 'Contas Ativas', value: contasFinanceiras.filter(c => c.ativa).length, icon: Landmark, type: 'number' },
    { title: 'Maior Saldo', value: Math.max(...contasFinanceiras.map(c => c.saldoAtual)), icon: TrendingUp, accent: '#2E7D32', type: 'currency' },
    { title: 'Menor Saldo', value: Math.min(...contasFinanceiras.map(c => c.saldoAtual)), icon: TrendingDown, accent: '#C62828', type: 'currency' },
  ]

  return (
    <div>
      <PageHeader
        title="Contas Financeiras"
        subtitle="Gestão de contas bancárias, caixa e cartões"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" /> Nova Conta
          </button>
        }
      />
      <SummaryCards cards={cards} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contasFinanceiras.map(conta => {
          const Icon = ICONS[conta.tipo] || Landmark
          const color = COLORS[conta.tipo] || '#006398'
          return (
            <button
              key={conta.id}
              onClick={() => setSelected(conta)}
              className="text-left p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">{conta.banco}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-label">{conta.tipo}</p>
                </div>
                {conta.contaPadrao && <span className="text-[9px] font-bold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-full">PADRÃO</span>}
              </div>
              <p className="text-xs text-text-muted truncate mb-1">{conta.nome}</p>
              <p className={`text-xl font-bold tracking-editorial ${conta.saldoAtual < 0 ? 'text-error' : 'text-on-surface'}`}>
                {fmt(conta.saldoAtual)}
              </p>
              <p className="text-[10px] text-text-muted mt-1">Últ. conciliação: {new Date(conta.ultimaConciliacao + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            </button>
          )
        })}
      </div>

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.nome} subtitle={selected?.banco}>
        {selected && (
          <div className="space-y-3">
            {[
              ['Banco', selected.banco],
              ['Tipo', selected.tipo],
              ['Agência', selected.agencia],
              ['Conta', selected.conta],
              ['Saldo Atual', <span className={`font-bold text-base ${selected.saldoAtual < 0 ? 'text-error' : 'text-on-surface'}`}>{fmt(selected.saldoAtual)}</span>],
              ['Saldo Inicial', fmt(selected.saldoInicial)],
              ['Abertura', new Date(selected.dataAbertura + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Última Conciliação', new Date(selected.ultimaConciliacao + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Status', <StatusBadge status={selected.ativa ? 'ativo' : 'inativo'} />],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{l}</span>
                <span className="text-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
