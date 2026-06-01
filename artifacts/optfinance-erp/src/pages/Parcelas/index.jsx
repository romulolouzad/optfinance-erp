import { useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import { parcelas } from '../../data/index'
import { DollarSign, AlertTriangle, Clock } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 10

export default function ParcelasPage() {
  const [search, setSearch] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return parcelas.filter(p => {
      const matchSearch = !search || p.clienteNome.toLowerCase().includes(search.toLowerCase()) || p.numero.includes(search)
      const matchSituacao = !situacaoFiltro || p.situacao === situacaoFiltro
      return matchSearch && matchSituacao
    })
  }, [search, situacaoFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalAReceber = parcelas
    .filter(p => ['em-aberto', 'pagamento-parcial'].includes(p.situacao))
    .reduce((s, p) => s + p.valorBruto - p.valorRecebido, 0)

  const totalPago = parcelas
    .filter(p => p.situacao === 'paga')
    .reduce((s, p) => s + p.valorRecebido, 0)

  const totalVencido = parcelas
    .filter(p => p.situacao === 'vencida')
    .reduce((s, p) => s + p.valorBruto, 0)

  const cards = [
    { title: 'Total Recebido', value: totalPago, icon: DollarSign, accent: '#2E7D32', type: 'currency' },
    { title: 'A Receber', value: totalAReceber, icon: Clock, accent: '#F57F17', type: 'currency' },
    { title: 'Vencido', value: totalVencido, icon: AlertTriangle, accent: '#C62828', type: 'currency' },
    { title: 'Total de Parcelas', value: parcelas.length, icon: DollarSign, type: 'number' },
  ]

  const columns = [
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Parcela', accessor: 'numero', cell: r => <span className="text-xs font-mono bg-surface-container px-2 py-0.5 rounded">{r.numero}</span> },
    { header: 'Vencimento', accessor: 'vencimento', cell: r => new Date(r.vencimento + 'T00:00:00').toLocaleDateString('pt-BR') },
    { header: 'Valor', accessor: 'valorBruto', align: 'right', cell: r => <span className="font-semibold">{fmt(r.valorBruto)}</span> },
    { header: 'Recebido', accessor: 'valorRecebido', align: 'right', cell: r => fmt(r.valorRecebido) },
    { header: 'NF', accessor: 'nfEmitida', align: 'center', sortable: false, cell: r => <span className={r.nfEmitida ? 'text-green-600 font-bold text-xs' : 'text-text-muted text-xs'}>{ r.nfEmitida ? 'Sim' : '—' }</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Parcelas"
        subtitle="Controle de recebimentos e inadimplência"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </>
        }
      />
      <SummaryCards cards={cards} />
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[
          {
            value: situacaoFiltro,
            onChange: v => { setSituacaoFiltro(v); setPage(1) },
            placeholder: 'Todos os status',
            options: [
              { value: 'paga', label: 'Paga' },
              { value: 'em-aberto', label: 'Em Aberto' },
              { value: 'vencida', label: 'Vencida' },
              { value: 'pagamento-parcial', label: 'Pagamento Parcial' },
            ]
          }
        ]}
      />
      <DataTable columns={columns} data={paginated} keyField="id" onRowClick={setSelected} />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe da Parcela" subtitle={selected ? `${selected.clienteNome} — Parcela ${selected.numero}` : ''}>
        {selected && (
          <div className="space-y-4 text-sm">
            <Row label="Cliente" value={selected.clienteNome} />
            <Row label="Parcela" value={selected.numero} />
            <Row label="Vencimento" value={new Date(selected.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')} />
            <Row label="Valor Bruto" value={fmt(selected.valorBruto)} />
            <Row label="Valor Recebido" value={fmt(selected.valorRecebido)} />
            <Row label="Situação" value={<StatusBadge status={selected.situacao} />} />
            <Row label="NF Emitida" value={selected.nfEmitida ? 'Sim' : 'Não'} />
            {selected.comprovante && <Row label="Comprovante" value={selected.comprovante} />}
            {selected.recebimento && <Row label="Data Recebimento" value={new Date(selected.recebimento + 'T00:00:00').toLocaleDateString('pt-BR')} />}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-surface-container">
      <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{label}</span>
      <span className="text-right text-on-surface font-medium">{value}</span>
    </div>
  )
}
