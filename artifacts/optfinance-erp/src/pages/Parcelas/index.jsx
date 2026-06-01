import { useState, useMemo } from 'react'
import { useToast } from '../../hooks/use-toast'
import {
  Download, Plus, CheckCircle, Minus, AlertTriangle,
  DollarSign, TrendingUp, Hash, Clock
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import FormRegistrarPagamento from './FormRegistrarPagamento'
import { useParcelas } from '../../hooks/useParcelas'
import { vendas } from '../../data/index'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (s) => s ? new Date(s + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
const PAGE_SIZE = 10
const TODAY = new Date().toISOString().slice(0, 10)

// Build vendedor lookup from vendas
const vendedorMap = {}
const vendedores = []
const vendedorSet = new Set()
vendas.forEach(v => {
  vendedorMap[v.id] = v.vendedor || ''
  if (v.vendedor && !vendedorSet.has(v.vendedor)) {
    vendedorSet.add(v.vendedor)
    vendedores.push(v.vendedor)
  }
})

const TABS = [
  { key: 'todos', label: 'Parcelas & Recebimentos' },
  { key: 'vencida', label: 'Em Atraso' },
  { key: 'paga', label: 'Pagas Recentemente' },
]

export default function ParcelasPage() {
  const { parcelas, registrarPagamento } = useParcelas()
  const { usuario } = useAuth()
  const { toast } = useToast()

  const [tab, setTab] = useState('todos')
  const [clienteSearch, setClienteSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [registrando, setRegistrando] = useState(null)

  function resetFilters() {
    setClienteSearch('')
    setStatusFiltro('')
    setDataInicio('')
    setDataFim('')
    setVendedorFiltro('')
    setPage(1)
  }

  const hasFilters = clienteSearch || statusFiltro || dataInicio || dataFim || vendedorFiltro

  const filtered = useMemo(() => {
    return parcelas.filter(p => {
      if (p.tipo === 'projetado') return false

      // Tab filter
      if (tab === 'vencida' && p.situacao !== 'vencida') return false
      if (tab === 'paga' && p.situacao !== 'paga') return false

      // Client search
      if (clienteSearch && !(p.clienteNome || '').toLowerCase().includes(clienteSearch.toLowerCase())) return false

      // Status filter (only in "todos" tab; in other tabs the tab itself is the filter)
      if (tab === 'todos' && statusFiltro && p.situacao !== statusFiltro) return false

      // Date range on vencimento
      if (dataInicio && p.vencimento < dataInicio) return false
      if (dataFim && p.vencimento > dataFim) return false

      // Vendedor
      if (vendedorFiltro) {
        const v = vendedorMap[p.vendaId] || ''
        if (!v.toLowerCase().includes(vendedorFiltro.toLowerCase())) return false
      }

      return true
    })
  }, [parcelas, tab, clienteSearch, statusFiltro, dataInicio, dataFim, vendedorFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary cards (from filtered data)
  const totalAReceber = filtered
    .filter(p => ['em-aberto', 'pagamento-parcial'].includes(p.situacao))
    .reduce((s, p) => s + (p.valorBruto - p.valorRecebido), 0)

  const totalVencidas = filtered
    .filter(p => p.situacao === 'vencida')
    .reduce((s, p) => s + p.valorBruto, 0)

  const recebidoPeriodo = filtered
    .filter(p => p.situacao === 'paga' && p.recebimento &&
      (!dataInicio || p.recebimento >= dataInicio) &&
      (!dataFim || p.recebimento <= dataFim))
    .reduce((s, p) => s + p.valorRecebido, 0)

  const totalParcial = filtered.filter(p => p.situacao === 'pagamento-parcial').length

  const cards = [
    { title: 'Total a Receber', value: totalAReceber, icon: DollarSign, accent: '#006398', type: 'currency' },
    { title: 'Vencidas', value: totalVencidas, icon: AlertTriangle, accent: '#C62828', type: 'currency' },
    { title: 'Recebido no Período', value: recebidoPeriodo, icon: TrendingUp, accent: '#2E7D32', type: 'currency' },
    { title: 'Pag. Parcial', value: totalParcial, icon: Hash, accent: '#F57F17', type: 'number' },
  ]

  const columns = [
    {
      header: 'Nº',
      accessor: 'numero',
      cell: r => (
        <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded font-semibold tracking-tight">
          {r.numero}
        </span>
      )
    },
    {
      header: 'Cliente',
      accessor: 'clienteNome',
      cell: r => <span className="font-semibold text-on-surface">{r.clienteNome}</span>
    },
    {
      header: 'Vencimento',
      accessor: 'vencimento',
      cell: r => {
        const overdue = r.situacao !== 'paga' && r.vencimento < TODAY
        return (
          <span className={cn('text-sm', overdue ? 'text-error font-semibold' : 'text-on-surface')}>
            {fmtDate(r.vencimento)}
          </span>
        )
      }
    },
    {
      header: 'Valor',
      accessor: 'valorBruto',
      align: 'right',
      cell: r => <span className="font-semibold">{fmt(r.valorBruto)}</span>
    },
    {
      header: 'Status',
      accessor: 'situacao',
      sortable: false,
      cell: r => <StatusBadge status={r.situacao} />
    },
    {
      header: 'NF',
      accessor: 'nfEmitida',
      align: 'center',
      sortable: false,
      cell: r => r.nfEmitida
        ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
        : <Minus className="w-4 h-4 text-text-muted mx-auto" />
    },
    {
      header: 'Recebimento',
      accessor: 'recebimento',
      cell: r => <span className="text-sm text-text-muted">{fmtDate(r.recebimento)}</span>
    },
    {
      header: 'Ações',
      accessor: '_acoes',
      sortable: false,
      cell: r => {
        const canRegister = ['em-aberto', 'vencida', 'pagamento-parcial'].includes(r.situacao)
        if (!canRegister) return <span className="text-xs text-text-muted">—</span>
        return (
          <button
            onClick={e => { e.stopPropagation(); setRegistrando(r) }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:shadow-md active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
          >
            Registrar
          </button>
        )
      }
    },
  ]

  function handleConfirmarPagamento(payload) {
    registrarPagamento({ ...payload, usuario: usuario?.usuario })
    setRegistrando(null)
    if (selected?.id === payload.parcelaId) setSelected(null)
    toast({
      title: 'Pagamento registrado com sucesso',
      description: `Parcela ${registrando?.numero} — ${registrando?.clienteNome}`,
    })
  }

  const vendedorDaParcela = (p) => vendedorMap[p?.vendaId] || '—'

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5 border-b border-surface-container-high pb-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setStatusFiltro(''); setPage(1) }}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors relative',
              tab === t.key
                ? 'text-primary-container bg-surface-container-lowest'
                : 'text-text-muted hover:text-on-surface hover:bg-surface-container'
            )}
          >
            {t.label}
            {tab === t.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: '#F97316' }}
              />
            )}
          </button>
        ))}
      </div>

      <PageHeader
        title="Parcelamentos & Recebimentos"
        subtitle="Controle de parcelas, inadimplência e registro de recebimentos"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container transition-colors text-on-surface">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button
              onClick={() => {
                const primeiro = filtered.find(p => ['em-aberto', 'vencida', 'pagamento-parcial'].includes(p.situacao))
                if (primeiro) setRegistrando(primeiro)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:shadow-md active:scale-95"
              style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Pagamento
            </button>
          </>
        }
      />

      <SummaryCards cards={cards} />

      {/* Inline filter row */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {/* Cliente */}
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={clienteSearch}
            onChange={e => { setClienteSearch(e.target.value); setPage(1) }}
            placeholder="Buscar cliente..."
            className="w-full pl-4 pr-4 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
        </div>

        {/* Status (only in todos tab) */}
        {tab === 'todos' && (
          <div className="relative">
            <select
              value={statusFiltro}
              onChange={e => { setStatusFiltro(e.target.value); setPage(1) }}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 text-sm rounded-lg cursor-pointer transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-container/40',
                statusFiltro
                  ? 'bg-primary-container/10 text-primary-container font-semibold'
                  : 'bg-surface-container-low text-on-surface'
              )}
            >
              <option value="">Todos os status</option>
              <option value="em-aberto">Em Aberto</option>
              <option value="paga">Paga</option>
              <option value="pagamento-parcial">Pagamento Parcial</option>
              <option value="vencida">Vencida</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: statusFiltro ? '#F97316' : '#6B7280' }}>▾</span>
          </div>
        )}

        {/* Período de Vencimento */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-text-muted font-semibold whitespace-nowrap">Vencimento:</label>
          <input
            type="date"
            value={dataInicio}
            onChange={e => { setDataInicio(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
          <span className="text-xs text-text-muted">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={e => { setDataFim(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
        </div>

        {/* Vendedor */}
        <div className="relative">
          <select
            value={vendedorFiltro}
            onChange={e => { setVendedorFiltro(e.target.value); setPage(1) }}
            className={cn(
              'appearance-none pl-3 pr-8 py-2 text-sm rounded-lg cursor-pointer transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-container/40',
              vendedorFiltro
                ? 'bg-primary-container/10 text-primary-container font-semibold'
                : 'bg-surface-container-low text-on-surface'
            )}
          >
            <option value="">Todos os vendedores</option>
            {vendedores.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: vendedorFiltro ? '#F97316' : '#6B7280' }}>▾</span>
        </div>

        {/* Limpar */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm font-semibold rounded-lg text-error hover:bg-error/10 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        onRowClick={setSelected}
      />
      <Pagination
        page={page}
        totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />

      {/* SlidePanel — Installment detail */}
      <SlidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhe da Parcela"
        subtitle={selected ? `${selected.clienteNome} — Parcela ${selected.numero}` : ''}
        width="md"
      >
        {selected && (
          <div className="space-y-1">
            <SectionTitle>Dados da Parcela</SectionTitle>
            <Row label="Nº da Parcela" value={<span className="font-mono font-bold">{selected.numero}</span>} />
            <Row label="Cliente" value={<span className="font-semibold">{selected.clienteNome}</span>} />
            <Row label="Vencimento" value={
              <span className={cn(selected.situacao !== 'paga' && selected.vencimento < TODAY ? 'text-error font-semibold' : '')}>
                {fmtDate(selected.vencimento)}
              </span>
            } />
            <Row label="Valor da Parcela" value={<span className="font-bold">{fmt(selected.valorBruto)}</span>} />
            <Row label="Valor Recebido" value={fmt(selected.valorRecebido)} />
            <Row label="Saldo em Aberto" value={fmt(selected.valorBruto - selected.valorRecebido)} />
            <Row label="Situação" value={<StatusBadge status={selected.situacao} />} />
            <Row label="NF Emitida" value={selected.nfEmitida ? 'Sim' : 'Não'} />
            {selected.recebimento && <Row label="Data do Recebimento" value={fmtDate(selected.recebimento)} />}
            {selected.comprovante && <Row label="Comprovante" value={selected.comprovante} />}

            <div className="pt-4 pb-1">
              <SectionTitle>Dados da Venda (stub)</SectionTitle>
            </div>
            <Row label="Vendedor" value={vendedorDaParcela(selected)} />
            <Row label="Venda ID" value={<span className="font-mono text-xs">{selected.vendaId}</span>} />
            <Row label="Centro de Custo" value={selected.centroCustoId} />
            <Row label="Conta Financeira" value={selected.contaFinanceiraId} />

            {['em-aberto', 'vencida', 'pagamento-parcial'].includes(selected.situacao) && (
              <div className="pt-4">
                <button
                  onClick={() => { setRegistrando(selected); setSelected(null) }}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:shadow-md active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
                >
                  Registrar Pagamento
                </button>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      {/* FormRegistrarPagamento modal */}
      {registrando && (
        <FormRegistrarPagamento
          parcela={registrando}
          onClose={() => setRegistrando(null)}
          onConfirm={handleConfirmarPagamento}
        />
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container pt-2 pb-1">
      {children}
    </p>
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
