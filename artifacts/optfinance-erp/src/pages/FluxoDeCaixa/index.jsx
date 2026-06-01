import { useState, useMemo } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import { useMovimentacoes } from '../../hooks/useParcelas'
import { ArrowUpRight, ArrowDownRight, CandlestickChart } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 12

export default function FluxoDeCaixaPage() {
  const movimentacoes = useMovimentacoes()
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return movimentacoes.filter(m => {
      const matchSearch = !search || m.descricao.toLowerCase().includes(search.toLowerCase()) || m.categoria.toLowerCase().includes(search.toLowerCase())
      const matchTipo = !tipoFiltro || m.tipo === tipoFiltro
      return matchSearch && matchTipo
    })
  }, [movimentacoes, search, tipoFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const entradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((s, m) => s + (m.entrada || 0), 0)
  const saidas = movimentacoes.filter(m => m.tipo === 'saida').reduce((s, m) => s + (m.saida || 0), 0)
  const projetado = movimentacoes.filter(m => m.tipo === 'projetado')
  const saldoProjetado = projetado.reduce((s, m) => s + (m.entrada || 0) - (m.saida || 0), 0)

  const cards = [
    { title: 'Total Entradas', value: entradas, icon: ArrowUpRight, accent: '#2E7D32', type: 'currency' },
    { title: 'Total Saídas', value: saidas, icon: ArrowDownRight, accent: '#C62828', type: 'currency' },
    { title: 'Resultado Real', value: entradas - saidas, icon: CandlestickChart, accent: entradas > saidas ? '#2E7D32' : '#C62828', type: 'currency' },
    { title: 'Saldo Projetado (previsto)', value: saldoProjetado, icon: CandlestickChart, accent: '#F57F17', type: 'currency' },
  ]

  const columns = [
    { header: 'Data', accessor: 'data', cell: r => new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR') },
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Categoria', accessor: 'categoria' },
    { header: 'Conta', accessor: 'conta' },
    { header: 'Entrada', accessor: 'entrada', align: 'right', cell: r => r.entrada ? <span className="font-semibold text-green-700">{fmt(r.entrada)}</span> : <span className="text-text-muted">—</span> },
    { header: 'Saída', accessor: 'saida', align: 'right', cell: r => r.saida ? <span className="font-semibold text-error">{fmt(r.saida)}</span> : <span className="text-text-muted">—</span> },
    { header: 'Tipo', accessor: 'tipo', sortable: false, cell: r => <StatusBadge status={r.tipo} /> },
  ]

  return (
    <div>
      <PageHeader title="Fluxo de Caixa" subtitle="Movimentações financeiras consolidadas" />
      <SummaryCards cards={cards} />
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[{
          value: tipoFiltro,
          onChange: v => { setTipoFiltro(v); setPage(1) },
          placeholder: 'Todos os tipos',
          options: [
            { value: 'entrada', label: 'Entradas' },
            { value: 'saida', label: 'Saídas' },
            { value: 'projetado', label: 'Projetados' },
          ]
        }]}
      />
      <DataTable columns={columns} data={paginated} keyField="id" />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  )
}
