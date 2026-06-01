import { useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import { vendas } from '../../data/index'
import { TrendingUp, ShoppingCart, Target } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 10

export default function VendasPage() {
  const [search, setSearch] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return vendas.filter(v => {
      const matchSearch = !search || v.clienteNome.toLowerCase().includes(search.toLowerCase()) || v.numero.includes(search)
      const matchSituacao = !situacaoFiltro || v.situacao === situacaoFiltro
      return matchSearch && matchSituacao
    })
  }, [search, situacaoFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const ativas = vendas.filter(v => v.situacao === 'ativa').reduce((s, v) => s + v.valorTotal, 0)
  const projecao = vendas.filter(v => v.situacao === 'projecao').reduce((s, v) => s + v.valorTotal, 0)

  const cards = [
    { title: 'Pipeline Ativo', value: ativas, icon: TrendingUp, accent: '#2E7D32', type: 'currency' },
    { title: 'Em Projeção', value: projecao, icon: Target, accent: '#F57F17', type: 'currency' },
    { title: 'Total de Contratos', value: vendas.filter(v => v.situacao === 'ativa').length, icon: ShoppingCart, type: 'number' },
    { title: 'Receita Total Portfolio', value: vendas.reduce((s, v) => s + v.valorTotal, 0), icon: TrendingUp, type: 'currency' },
  ]

  const columns = [
    { header: 'Nº', accessor: 'numero', cell: r => <span className="text-xs font-mono">{r.numero}</span> },
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Vendedor', accessor: 'vendedor' },
    { header: 'Tipo', accessor: 'tipoVenda', cell: r => <span className="text-xs capitalize">{r.tipoVenda}</span> },
    { header: 'Competência', accessor: 'competencia', cell: r => { const [y, m] = r.competencia.split('-'); return `${m}/${y}` } },
    { header: 'Valor Total', accessor: 'valorTotal', align: 'right', cell: r => <span className="font-semibold">{fmt(r.valorTotal)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Pipeline de vendas e contratos ativos"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
              <Plus className="w-3.5 h-3.5" /> Nova Venda
            </button>
          </>
        }
      />
      <SummaryCards cards={cards} />
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[{
          value: situacaoFiltro,
          onChange: v => { setSituacaoFiltro(v); setPage(1) },
          placeholder: 'Todos os status',
          options: [
            { value: 'ativa', label: 'Ativa' },
            { value: 'projecao', label: 'Projeção' },
            { value: 'encerrada', label: 'Encerrada' },
            { value: 'perdida', label: 'Perdida' },
          ]
        }]}
      />
      <DataTable columns={columns} data={paginated} keyField="id" onRowClick={setSelected} />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe da Venda" subtitle={selected ? `#${selected.numero} — ${selected.clienteNome}` : ''}>
        {selected && (
          <div className="space-y-4 text-sm">
            {[
              ['Número', `#${selected.numero}`],
              ['Cliente', selected.clienteNome],
              ['Vendedor', selected.vendedor],
              ['Tipo', selected.tipoVenda],
              ['Competência', selected.competencia],
              ['Valor Total', fmt(selected.valorTotal)],
              ['Situação', <StatusBadge status={selected.situacao} />],
              ['Descrição', selected.descricao],
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
