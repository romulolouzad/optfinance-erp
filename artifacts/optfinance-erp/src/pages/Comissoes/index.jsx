import { useState, useMemo, useEffect } from 'react'
import { Link } from 'wouter'
import { Download, DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import Pagination from '../../components/shared/Pagination'
import { comissoes as comissoesMock } from '../../data/index'
import { registrarPagamentoComissao } from '../../hooks/useParcelas'
import { registrarHistorico } from '../../data/historico-store'
import { cn } from '../../utils/cn'
import FormPagarComissao from './FormPagarComissao'
import FormAjustarPercentual from './FormAjustarPercentual'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const PAGE_SIZE = 10

const MES_ATUAL = new Date().toISOString().slice(0, 7)

const COMISSOES_BASE = comissoesMock.filter(c => !c.tipo)

function StatusComissaoBadge({ status }) {
  const map = {
    'aguardando-nf': { label: 'Aguardando NF', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'pronta': { label: 'Pronta', bg: 'bg-blue-100', text: 'text-blue-700' },
    'paga': { label: 'Paga', bg: 'bg-green-100', text: 'text-green-700' },
  }
  const s = map[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', s.bg, s.text)}>
      {s.label}
    </span>
  )
}

export default function ComissoesPage() {
  const { perfil, usuario } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])
  const isAdmin = perfil === 'admin'
  const COMERCIAL_VENDEDOR = { comercial: 'Marcos Oliveira' }
  const vendedorPermitido = COMERCIAL_VENDEDOR[perfil] || null

  const [comissoes, setComissoes] = useState(COMISSOES_BASE)

  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [vendaSearch, setVendaSearch] = useState('')
  const [page, setPage] = useState(1)

  const [pagando, setPagando] = useState(null)
  const [ajustando, setAjustando] = useState(null)

  const vendedores = useMemo(() => {
    const s = new Set(comissoes.map(c => c.vendedor))
    return [...s].sort()
  }, [comissoes])

  const hasFilters = vendedorFiltro || statusFiltro || dataInicio || dataFim || vendaSearch

  function resetFilters() {
    setVendedorFiltro('')
    setStatusFiltro('')
    setDataInicio('')
    setDataFim('')
    setVendaSearch('')
    setPage(1)
  }

  const filtered = useMemo(() => {
    return comissoes.filter(c => {
      if (vendedorPermitido && c.vendedor !== vendedorPermitido) return false
      if (vendedorFiltro && c.vendedor !== vendedorFiltro) return false
      if (statusFiltro && c.status !== statusFiltro) return false
      if (dataInicio && c.competencia < dataInicio.slice(0, 7)) return false
      if (dataFim && c.competencia > dataFim.slice(0, 7)) return false
      if (vendaSearch) {
        const q = vendaSearch.toLowerCase().replace('#', '').replace('ven-', '')
        if (!c.vendaId.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [comissoes, vendedorFiltro, statusFiltro, dataInicio, dataFim, vendaSearch, vendedorPermitido])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const aguardandoNF = comissoes.filter(c => c.status === 'aguardando-nf')
  const prontas = comissoes.filter(c => c.status === 'pronta')
  const pagasNoMes = comissoes.filter(c => c.status === 'paga' && c.dataPagamento?.startsWith(MES_ATUAL))
  const pendentes = comissoes.filter(c => c.status !== 'paga')

  const cards = [
    {
      title: 'Aguardando NF',
      value: aguardandoNF.reduce((s, c) => s + c.valor, 0),
      icon: Clock,
      accent: '#F57F17',
      type: 'currency',
    },
    {
      title: 'Prontas para Pagar',
      value: prontas.reduce((s, c) => s + c.valor, 0),
      icon: DollarSign,
      accent: '#006398',
      type: 'currency',
    },
    {
      title: 'Pagas no Mês',
      value: pagasNoMes.reduce((s, c) => s + c.valor, 0),
      icon: CheckCircle,
      accent: '#2E7D32',
      type: 'currency',
    },
    {
      title: 'Total Provisionado',
      value: pendentes.reduce((s, c) => s + c.valor, 0),
      icon: TrendingUp,
      accent: '#584237',
      type: 'currency',
    },
  ]

  const columns = [
    {
      header: 'Parcela',
      accessor: 'parcelaNumero',
      cell: r => (
        <Link
          href={`/vendas/${r.vendaId}`}
          onClick={e => e.stopPropagation()}
          className="font-mono text-xs font-bold text-on-surface hover:text-primary-container transition-colors"
        >
          {r.parcelaNumero}
        </Link>
      )
    },
    {
      header: 'Venda',
      accessor: 'vendaId',
      cell: r => (
        <Link
          href={`/vendas/${r.vendaId}`}
          onClick={e => e.stopPropagation()}
          className="text-sm font-semibold text-primary-container hover:underline transition-colors"
        >
          #{r.vendaId}
        </Link>
      )
    },
    {
      header: 'Cliente',
      accessor: 'clienteNome',
      cell: r => <span className="font-medium text-on-surface">{r.clienteNome}</span>
    },
    {
      header: 'Vendedor',
      accessor: 'vendedor',
      cell: r => <span className="text-sm text-on-surface">{r.vendedor}</span>
    },
    {
      header: '%',
      accessor: 'percentual',
      align: 'right',
      cell: r => <span className="text-sm font-semibold">{r.percentual}%</span>
    },
    {
      header: 'Valor',
      accessor: 'valor',
      align: 'right',
      cell: r => <span className="font-bold text-on-surface">{fmt(r.valor)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
      cell: r => <StatusComissaoBadge status={r.status} />
    },
    {
      header: 'Ações',
      accessor: '_acoes',
      sortable: false,
      printHidden: true,
      cell: r => (
        <div className="flex items-center gap-2">
          {r.status === 'pronta' && (
            <button
              onClick={e => { e.stopPropagation(); setPagando(r) }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:shadow-md active:scale-95"
              style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
            >
              Pagar
            </button>
          )}
          {isAdmin && r.status !== 'paga' && (
            <button
              onClick={e => { e.stopPropagation(); setAjustando(r) }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors"
            >
              Ajustar %
            </button>
          )}
          {r.status === 'paga' && !isAdmin && (
            <span className="text-xs text-text-muted">—</span>
          )}
          {r.status === 'aguardando-nf' && !isAdmin && (
            <span className="text-xs text-text-muted">—</span>
          )}
        </div>
      )
    },
  ]

  function handlePagarComissao(payload) {
    const comissao = comissoes.find(c => c.id === payload.comissaoId)
    setComissoes(prev =>
      prev.map(c =>
        c.id === payload.comissaoId
          ? { ...c, status: 'paga', dataPagamento: payload.dataPagamento }
          : c
      )
    )
    if (comissao) {
      registrarPagamentoComissao({
        comissaoId: comissao.id,
        vendedor: comissao.vendedor,
        clienteNome: comissao.clienteNome,
        parcelaNumero: comissao.parcelaNumero,
        valor: comissao.valor,
        dataPagamento: payload.dataPagamento,
        contaId: payload.contaId,
        usuario: usuario?.usuario,
      })
    }
    setPagando(null)
    toast({
      title: 'Comissão paga com sucesso',
      description: `Pagamento de ${fmt(comissao?.valor || 0)} registrado para ${comissao?.vendedor}.`,
    })
  }

  function handleAjustarPercentual(payload) {
    const comissao = comissoes.find(c => c.id === payload.comissaoId)
    setComissoes(prev =>
      prev.map(c =>
        c.id === payload.comissaoId
          ? { ...c, percentual: payload.novoPercentual, valor: payload.novoValor }
          : c
      )
    )
    if (comissao) {
      registrarHistorico({
        acao: `Ajuste de comissão — ${comissao.vendedor} — Parcela ${comissao.parcelaNumero}`,
        tipoEvento: 'normal',
        entidade: 'Comissao',
        entidadeId: comissao.id,
        detalhes: payload.motivo ? `Motivo: ${payload.motivo}` : undefined,
        camposAlterados: [
          { campo: 'percentual', valorAnterior: String(payload.percentualAnterior), novoValor: String(payload.novoPercentual) },
          { campo: 'valor', valorAnterior: null, novoValor: String(payload.novoValor) },
        ],
      })
    }
    setAjustando(null)
    toast({
      title: 'Percentual ajustado',
      description: `Comissão atualizada de ${payload.percentualAnterior}% para ${payload.novoPercentual}%. Ação registrada no histórico.`,
    })
  }

  return (
    <div>
      <PageHeader
        title="Comissões"
        subtitle="Controle de comissões por vendedor e parcela"
        actions={
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container transition-colors text-on-surface">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        }
      />

      <SummaryCards cards={cards} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
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
            <option value="">Todos os Vendedores</option>
            {vendedores.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: vendedorFiltro ? '#F97316' : '#6B7280' }}
          >▾</span>
        </div>

        {/* Status */}
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
            <option value="">Todos os Status</option>
            <option value="aguardando-nf">Aguardando NF</option>
            <option value="pronta">Pronta</option>
            <option value="paga">Paga</option>
          </select>
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: statusFiltro ? '#F97316' : '#6B7280' }}
          >▾</span>
        </div>

        {/* Período */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-text-muted font-semibold whitespace-nowrap">Período:</label>
          <input
            type="month"
            value={dataInicio}
            onChange={e => { setDataInicio(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
          <span className="text-xs text-text-muted">até</span>
          <input
            type="month"
            value={dataFim}
            onChange={e => { setDataFim(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
        </div>

        {/* Busca por venda */}
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={vendaSearch}
            onChange={e => { setVendaSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por venda (#VEN-...)"
            className="w-full pl-4 pr-4 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow"
          />
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
        emptyMessage={hasFilters ? 'Nenhuma comissão corresponde ao filtro aplicado.' : 'Nenhuma comissão cadastrada.'}
        onRetry={hasFilters ? resetFilters : undefined}
        loading={loading}
      />
      <Pagination
        page={page}
        totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />

      {/* Modal Pagar */}
      {pagando && (
        <FormPagarComissao
          comissao={pagando}
          onClose={() => setPagando(null)}
          onConfirm={handlePagarComissao}
        />
      )}

      {/* Modal Ajustar % */}
      {ajustando && (
        <FormAjustarPercentual
          comissao={ajustando}
          onClose={() => setAjustando(null)}
          onConfirm={handleAjustarPercentual}
        />
      )}
    </div>
  )
}
