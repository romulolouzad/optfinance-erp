import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import { emprestimos } from '../../data/index'
import { BriefcaseBusiness, AlertTriangle, CheckCircle } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function EmprestimosPage() {
  const [selected, setSelected] = useState(null)

  const ativos = emprestimos.filter(e => e.situacao === 'ativo')
  const saldoDevedor = ativos.reduce((s, e) => s + e.saldoDevedor, 0)
  const valorOriginal = ativos.reduce((s, e) => s + e.valorOriginal, 0)

  const cards = [
    { title: 'Saldo Devedor Total', value: saldoDevedor, icon: BriefcaseBusiness, accent: '#C62828', type: 'currency' },
    { title: 'Valor Contratado (ativos)', value: valorOriginal, icon: BriefcaseBusiness, type: 'currency' },
    { title: 'Empréstimos Ativos', value: ativos.length, icon: BriefcaseBusiness, type: 'number' },
    { title: 'Inadimplentes', value: emprestimos.filter(e => e.situacao === 'inadimplente').length, icon: AlertTriangle, accent: '#C62828', type: 'number' },
  ]

  const columns = [
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Credor', accessor: 'credor' },
    { header: 'Tipo', accessor: 'tipo', cell: r => <span className="text-xs capitalize">{r.tipo.replace('-', ' ')}</span> },
    { header: 'Taxa (a.m.)', accessor: 'taxaJuros', align: 'right', cell: r => `${r.taxaJuros}%` },
    { header: 'Valor Original', accessor: 'valorOriginal', align: 'right', cell: r => fmt(r.valorOriginal) },
    { header: 'Saldo Devedor', accessor: 'saldoDevedor', align: 'right', cell: r => <span className={`font-bold ${r.saldoDevedor > 0 ? 'text-error' : 'text-green-600'}`}>{fmt(r.saldoDevedor)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  return (
    <div>
      <PageHeader title="Empréstimos & Financiamentos" subtitle="Controle de dívidas e obrigações financeiras" />
      <SummaryCards cards={cards} />
      <DataTable columns={columns} data={emprestimos} keyField="id" onRowClick={setSelected} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe do Empréstimo" subtitle={selected?.credor}>
        {selected && (
          <div className="space-y-3">
            {[
              ['Descrição', selected.descricao],
              ['Credor', selected.credor],
              ['Tipo', selected.tipo],
              ['Taxa (a.m.)', `${selected.taxaJuros}%`],
              ['Valor Original', fmt(selected.valorOriginal)],
              ['Saldo Devedor', <span className="font-bold text-error">{fmt(selected.saldoDevedor)}</span>],
              ['Início', new Date(selected.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Previsão Fim', new Date(selected.previsaoFim + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Status', <StatusBadge status={selected.situacao} />],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{l}</span>
                <span className="text-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
            {selected.parcelas.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-3">Últimas Parcelas</p>
                <div className="space-y-2">
                  {selected.parcelas.slice(-3).map(p => (
                    <div key={p.numero} className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                      <span className="text-xs font-mono">#{p.numero}</span>
                      <span className="text-xs">{new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span className="text-xs font-semibold">{fmt(p.valor)}</span>
                      <StatusBadge status={p.pago ? 'paga' : 'em-aberto'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
