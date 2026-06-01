import { useState, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import { Plus, AlertTriangle, Filter, X } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import Pagination from '../../components/shared/Pagination'
import { vendas, detectDuplicatas, getQtdParcelas, getParcelasPagas } from '../../data/vendas-store'
import { colaboradores } from '../../data/index'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function fmtCompetencia(c) {
  if (!c) return '-'
  const [y, m] = c.split('-')
  return `${MESES[parseInt(m, 10) - 1]} / ${y}`
}

function TipoBadge({ tipo }) {
  if (!tipo) return null
  const rec = tipo === 'recorrente'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${rec ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
      {rec ? 'Recorrente' : 'Pontual'}
    </span>
  )
}

function StatusBadgeVenda({ status }) {
  const map = {
    ativa:     { label: 'Ativa',     bg: '#2E7D321A', color: '#2E7D32' },
    projecao:  { label: 'Projeção',  bg: '#6B72801A', color: '#6B7280' },
    inativa:   { label: 'Inativa',   bg: '#F57F171A', color: '#F57F17' },
    perdida:   { label: 'Perdida',   bg: '#C628281A', color: '#C62828' },
    encerrada: { label: 'Encerrada', bg: '#111827',   color: '#fff' },
  }
  const key = (status || '').toLowerCase()
  const cfg = map[key] || { label: status, bg: '#6B72801A', color: '#6B7280' }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

const VENDEDORES = [...new Set(vendas.map(v => v.vendedor).filter(Boolean))].sort()
const PAGE_SIZE = 8

export default function VendasPage() {
  const [, navigate] = useLocation()
  const [search, setSearch] = useState('')
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [page, setPage] = useState(1)

  const duplicatas = useMemo(() => detectDuplicatas(), [vendas.length])

  const filtered = useMemo(() => {
    return vendas.filter(v => {
      const matchSearch = !search ||
        (v.clienteNome || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.vendedor || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.numero || '').includes(search) ||
        (v.id || '').toLowerCase().includes(search.toLowerCase())
      const matchVendedor = !vendedorFiltro || v.vendedor === vendedorFiltro
      const matchStatus = !statusFiltro || v.situacao === statusFiltro
      const matchTipo = !tipoFiltro || v.tipoVenda === tipoFiltro
      const matchInicio = !periodoInicio || v.competencia >= periodoInicio
      const matchFim = !periodoFim || v.competencia <= periodoFim
      return matchSearch && matchVendedor && matchStatus && matchTipo && matchInicio && matchFim
    })
  }, [search, vendedorFiltro, statusFiltro, tipoFiltro, periodoInicio, periodoFim, vendas.length])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilters() {
    setSearch('')
    setVendedorFiltro('')
    setStatusFiltro('')
    setPeriodoInicio('')
    setPeriodoFim('')
    setTipoFiltro('')
    setPage(1)
  }

  const hasFilters = search || vendedorFiltro || statusFiltro || periodoInicio || periodoFim || tipoFiltro

  const columns = [
    {
      header: 'ID',
      accessor: 'numero',
      cell: r => (
        <div>
          <span className="font-mono text-sm text-on-surface">#{r.numero || r.id}</span>
          {duplicatas.has(r.id) && (
            <div className="flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide leading-none">
                Possível Duplicidade
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessor: 'clienteNome',
      cell: r => <span className="font-bold text-on-surface">{r.clienteNome}</span>,
    },
    {
      header: 'Vendedor',
      accessor: 'vendedor',
    },
    {
      header: 'Valor Total',
      accessor: 'valorTotal',
      align: 'right',
      cell: r => (
        <span className="font-bold text-primary-container">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.valorTotal)}
        </span>
      ),
    },
    {
      header: 'Competência',
      accessor: 'competencia',
      cell: r => fmtCompetencia(r.competencia),
    },
    {
      header: 'Tipo',
      accessor: 'tipoVenda',
      sortable: false,
      cell: r => <TipoBadge tipo={r.tipoVenda} />,
    },
    {
      header: 'Status',
      accessor: 'situacao',
      sortable: false,
      cell: r => <StatusBadgeVenda status={r.situacao} />,
    },
    {
      header: 'Parcelas',
      accessor: 'parcelas',
      sortable: false,
      cell: r => {
        const total = getQtdParcelas(r)
        const pagas = getParcelasPagas(r)
        if (total === 0) return <span className="text-text-muted text-xs">—</span>
        return (
          <span className="font-mono text-sm">
            {String(pagas).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Vendas & Contratos"
        subtitle="Gestão de contratos e vendas"
        actions={
          <Link href="/vendas/nova">
            <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
              <Plus className="w-3.5 h-3.5" /> Nova Venda
            </button>
          </Link>
        }
      />

      {/* Inline filter bar — all in one line */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar cliente..."
          className="pl-3 pr-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow min-w-[160px]"
        />

        <div className="relative">
          <select
            value={vendedorFiltro}
            onChange={e => { setVendedorFiltro(e.target.value); setPage(1) }}
            className={`appearance-none pl-3 pr-7 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/40 cursor-pointer transition-colors ${vendedorFiltro ? 'bg-primary-container/10 text-primary-container font-semibold' : 'bg-surface-container-low text-on-surface'}`}
          >
            <option value="">Todos os Vendedores</option>
            {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: vendedorFiltro ? '#F97316' : '#6B7280' }}>▾</span>
        </div>

        <div className="relative">
          <select
            value={statusFiltro}
            onChange={e => { setStatusFiltro(e.target.value); setPage(1) }}
            className={`appearance-none pl-3 pr-7 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/40 cursor-pointer transition-colors ${statusFiltro ? 'bg-primary-container/10 text-primary-container font-semibold' : 'bg-surface-container-low text-on-surface'}`}
          >
            <option value="">Todos os Status</option>
            <option value="ativa">Ativa</option>
            <option value="projecao">Projeção</option>
            <option value="inativa">Inativa</option>
            <option value="perdida">Perdida</option>
            <option value="encerrada">Encerrada</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: statusFiltro ? '#F97316' : '#6B7280' }}>▾</span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="month"
            value={periodoInicio}
            onChange={e => { setPeriodoInicio(e.target.value); setPage(1) }}
            className="pl-3 pr-2 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
          <span className="text-text-muted text-sm px-0.5">à</span>
          <input
            type="month"
            value={periodoFim}
            onChange={e => { setPeriodoFim(e.target.value); setPage(1) }}
            className="pl-3 pr-2 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
        </div>

        <div className="relative">
          <select
            value={tipoFiltro}
            onChange={e => { setTipoFiltro(e.target.value); setPage(1) }}
            className={`appearance-none pl-3 pr-7 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/40 cursor-pointer transition-colors ${tipoFiltro ? 'bg-primary-container/10 text-primary-container font-semibold' : 'bg-surface-container-low text-on-surface'}`}
          >
            <option value="">Todos os Tipos</option>
            <option value="pontual">Pontual</option>
            <option value="recorrente">Recorrente</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: tipoFiltro ? '#F97316' : '#6B7280' }}>▾</span>
        </div>

        <button
          onClick={clearFilters}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors font-medium ${hasFilters ? 'border-primary-container/40 text-primary-container hover:bg-primary-container/10' : 'border-surface-container text-text-muted hover:border-text-muted/50'}`}
        >
          <Filter className="w-3.5 h-3.5" />
          Limpar
          {hasFilters && <X className="w-3 h-3 ml-0.5" />}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        onRowClick={r => navigate(`/vendas/${r.id}`)}
      />
      <Pagination
        page={page}
        totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
