import { useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import { despesas } from '../../data/index'
import { MinusCircle, Clock, AlertTriangle } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 10

const CATEGORIAS = [...new Set(despesas.map(d => d.categoria))].sort()

export default function DespesasPage() {
  const [search, setSearch] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return despesas.filter(d => {
      const matchSearch = !search || d.descricao.toLowerCase().includes(search.toLowerCase())
      const matchSituacao = !situacaoFiltro || d.situacao === situacaoFiltro
      const matchCategoria = !categoriaFiltro || d.categoria === categoriaFiltro
      return matchSearch && matchSituacao && matchCategoria
    })
  }, [search, situacaoFiltro, categoriaFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPago = despesas.filter(d => d.situacao === 'paga').reduce((s, d) => s + d.valor, 0)
  const totalPrevisto = despesas.filter(d => d.situacao === 'prevista').reduce((s, d) => s + d.valor, 0)

  const cards = [
    { title: 'Total Pago', value: totalPago, icon: MinusCircle, accent: '#C62828', type: 'currency' },
    { title: 'A Pagar', value: totalPrevisto, icon: Clock, accent: '#F57F17', type: 'currency' },
    { title: 'Total de Lançamentos', value: despesas.length, icon: MinusCircle, type: 'number' },
    { title: 'Canceladas', value: despesas.filter(d => d.situacao === 'cancelada').length, icon: AlertTriangle, type: 'number', accent: '#6B7280' },
  ]

  const columns = [
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Categoria', accessor: 'categoria' },
    { header: 'Competência', accessor: 'competencia', cell: r => { const [y, m] = r.competencia.split('-'); return `${m}/${y}` } },
    { header: 'Vencimento', accessor: 'vencimento', cell: r => new Date(r.vencimento + 'T00:00:00').toLocaleDateString('pt-BR') },
    { header: 'Valor', accessor: 'valor', align: 'right', cell: r => <span className="font-semibold text-error">{fmt(r.valor)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Despesas"
        subtitle="Controle de custos e despesas da empresa"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
              <Plus className="w-3.5 h-3.5" /> Nova Despesa
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
              { value: 'prevista', label: 'Prevista' },
              { value: 'cancelada', label: 'Cancelada' },
            ]
          },
          {
            value: categoriaFiltro,
            onChange: v => { setCategoriaFiltro(v); setPage(1) },
            placeholder: 'Categoria',
            options: CATEGORIAS.map(c => ({ value: c, label: c }))
          }
        ]}
      />
      <DataTable columns={columns} data={paginated} keyField="id" onRowClick={setSelected} />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe da Despesa" subtitle={selected?.descricao}>
        {selected && (
          <div className="space-y-4 text-sm">
            {[
              ['Descrição', selected.descricao],
              ['Categoria', selected.categoria],
              ['Competência', selected.competencia],
              ['Vencimento', new Date(selected.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Valor', <span className="text-error font-bold">{fmt(selected.valor)}</span>],
              ['Situação', <StatusBadge status={selected.situacao} />],
              ['Conta', selected.contaFinanceiraId],
              ...(selected.pagamento ? [['Data Pagamento', new Date(selected.pagamento + 'T00:00:00').toLocaleDateString('pt-BR')]] : []),
              ...(selected.comprovante ? [['Comprovante', selected.comprovante]] : []),
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-start py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted shrink-0 mr-4">{l}</span>
                <span className="text-right text-on-surface font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
