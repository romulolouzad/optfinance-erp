import { useState, useMemo } from 'react'
import { Link } from 'wouter'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Download, Filter, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import forecastData from '../../data/forecast.json'
import centrosCusto from '../../data/centros-custo.json'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtK = (v) => {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`
  return fmt(v)
}

const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const HORIZONTE_OPTIONS = [
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

const VENDEDORES_OPTIONS = [
  { value: 'todos', label: 'Todos os vendedores' },
  ...forecastData.vendedores.map(v => ({ value: v.nome, label: v.nome })),
]

const CENTROS_OPTIONS = [
  { value: 'todos', label: 'Todos os centros' },
  ...centrosCusto.filter(c => c.ativo).map(c => ({ value: c.id, label: c.nome })),
]

function calcRisco(parcela) {
  if (parcela.situacao === 'confirmado' && parcela.historicoPagamentos === 'pontual') return 'Baixo'
  if (parcela.historicoPagamentos === 'atraso-frequente') return 'Alto'
  if (parcela.historicoPagamentos === 'irregular' || parcela.tipoVenda === 'Pontual') return 'Médio'
  return 'Baixo'
}

const RISCO_BADGE = {
  Baixo:  { dot: '#2E7D32', bg: '#F0FDF4', text: '#166534' },
  Médio:  { dot: '#CA8A04', bg: '#FEFCE8', text: '#854D0E' },
  Alto:   { dot: '#DC2626', bg: '#FEF2F2', text: '#991B1B' },
}

const TIPO_BADGE = {
  Recorrente: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Pontual:    { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
}

function BadgeTipo({ tipo }) {
  const s = TIPO_BADGE[tipo] || TIPO_BADGE.Pontual
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {tipo}
    </span>
  )
}

function BadgeRisco({ nivel }) {
  const s = RISCO_BADGE[nivel] || RISCO_BADGE.Médio
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {nivel}
    </span>
  )
}

function CustomLegend({ items }) {
  return (
    <div className="flex items-center gap-6 justify-center mt-3">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function buildMonthlyData(filteredParcelas, horizonte) {
  const horizMeses = parseInt(horizonte)
  const base = new Date('2026-06-01')
  const months = []
  for (let i = 0; i < horizMeses; i++) {
    const d = new Date(base)
    d.setMonth(d.getMonth() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
    months.push({ key, label, confirmado: 0, projetado: 0 })
  }

  filteredParcelas.forEach(p => {
    const bucket = months.find(m => m.key === p.competencia)
    if (!bucket) return
    if (p.situacao === 'confirmado') bucket.confirmado += p.valorBruto
    else bucket.projetado += p.valorBruto
  })

  return months.map(({ label, confirmado, projetado }) => ({ mes: label, confirmado, projetado }))
}

export default function ForecastPage() {
  const [horizonte, setHorizonte] = useState('6')
  const [centroCusto, setCentroCusto] = useState('todos')
  const [vendedor, setVendedor] = useState('todos')
  const [applied, setApplied] = useState({ horizonte: '6', centroCusto: 'todos', vendedor: 'todos' })

  function handleAtualizar() {
    setApplied({ horizonte, centroCusto, vendedor })
  }

  const parcelas = useMemo(() => {
    const horizMeses = parseInt(applied.horizonte)
    const base = new Date('2026-06-01')
    const limit = new Date(base)
    limit.setMonth(limit.getMonth() + horizMeses)
    const limitStr = `${limit.getFullYear()}-${String(limit.getMonth() + 1).padStart(2, '0')}`

    return forecastData.parcelas
      .filter(p => {
        const comp = p.competencia
        if (comp < '2026-06' || comp >= limitStr) return false
        if (applied.centroCusto !== 'todos' && p.centroCustoId !== applied.centroCusto) return false
        if (applied.vendedor !== 'todos' && p.vendedor !== applied.vendedor) return false
        return true
      })
      .map(p => ({ ...p, nivelRisco: calcRisco(p) }))
  }, [applied])

  const dadosMensais = useMemo(
    () => buildMonthlyData(parcelas, applied.horizonte),
    [parcelas, applied.horizonte]
  )

  const totalConfirmado = useMemo(() => parcelas.filter(p => p.situacao === 'confirmado').reduce((s, p) => s + p.valorBruto, 0), [parcelas])
  const totalProjetado = useMemo(() => parcelas.reduce((s, p) => s + p.valorBruto, 0), [parcelas])

  const recorrente = useMemo(() => parcelas.filter(p => p.tipoVenda === 'Recorrente').reduce((s, p) => s + p.valorBruto, 0), [parcelas])
  const pontual = useMemo(() => parcelas.filter(p => p.tipoVenda === 'Pontual').reduce((s, p) => s + p.valorBruto, 0), [parcelas])
  const totalPie = recorrente + pontual
  const pctRecorrente = totalPie > 0 ? Math.round((recorrente / totalPie) * 100) : 0

  const confianca = useMemo(() => {
    const baixo = parcelas.filter(p => p.nivelRisco === 'Baixo').length
    return parcelas.length > 0 ? Math.round((baixo / parcelas.length) * 100) : 0
  }, [parcelas])

  const vendedoresChart = useMemo(() => {
    const map = {}
    parcelas.forEach(p => {
      if (!map[p.vendedor]) map[p.vendedor] = { nome: p.vendedor, confirmado: 0, projetado: 0 }
      if (p.situacao === 'confirmado') map[p.vendedor].confirmado += p.valorBruto
      else map[p.vendedor].projetado += p.valorBruto
    })
    return Object.values(map)
      .map(v => ({ ...v, total: v.confirmado + v.projetado }))
      .sort((a, b) => b.total - a.total)
  }, [parcelas])

  const maxVendedor = vendedoresChart.reduce((m, v) => Math.max(m, v.total), 0) || 1

  const pieData = [
    { name: 'Pontual', value: pontual, color: '#F97316' },
    { name: 'Recorrente', value: recorrente, color: '#006398' },
  ]

  const COLUMNS = [
    {
      header: 'Venda',
      accessor: 'vendaId',
      cell: (row) => {
        const id = row.vendaId.replace('VEN-', '')
        return (
          <Link
            href={`/vendas/${id}`}
            className="font-mono text-xs font-semibold hover:underline"
            style={{ color: '#F97316' }}
          >
            #{row.vendaId}
          </Link>
        )
      },
    },
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Vendedor', accessor: 'vendedor' },
    {
      header: 'Competência',
      accessor: 'competencia',
      cell: (row) => {
        const [y, m] = row.competencia.split('-')
        return `${MONTH_LABELS[parseInt(m) - 1]}/${y.slice(2)}`
      },
    },
    {
      header: 'Venc. Prev.',
      accessor: 'vencimento',
      cell: (row) => {
        const [y, m, d] = row.vencimento.split('-')
        return `${d}/${m}/${y}`
      },
    },
    {
      header: 'Valor',
      accessor: 'valorBruto',
      align: 'right',
      cell: (row) => (
        <span className="font-semibold tabular-nums">{fmt(row.valorBruto)}</span>
      ),
    },
    {
      header: 'Tipo',
      accessor: 'tipoVenda',
      cell: (row) => <BadgeTipo tipo={row.tipoVenda} />,
    },
    {
      header: 'Nível de Risco',
      accessor: 'nivelRisco',
      cell: (row) => <BadgeRisco nivel={row.nivelRisco} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast"
        subtitle="Projeção de receitas e resultados futuros"
      />

      {/* Filtros inline */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Horizonte</label>
          <select
            value={horizonte}
            onChange={e => setHorizonte(e.target.value)}
            className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            {HORIZONTE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Centro de Custo</label>
          <select
            value={centroCusto}
            onChange={e => setCentroCusto(e.target.value)}
            className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            {CENTROS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Vendedor</label>
          <select
            value={vendedor}
            onChange={e => setVendedor(e.target.value)}
            className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            {VENDEDORES_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAtualizar}
          className="h-9 inline-flex items-center gap-2 px-4 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: '#F97316' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar Projeção
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Projetada */}
        <div
          className="rounded-xl bg-surface-container-lowest p-5 border-l-4"
          style={{ borderLeftColor: '#F97316', boxShadow: '0 1px 8px -2px rgba(249,115,22,0.10)' }}
        >
          <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-1">Receita Projetada</p>
          <p className="text-2xl font-black text-on-surface tabular-nums leading-none">{fmt(totalProjetado)}</p>
          <p className="text-xs font-semibold mt-2" style={{ color: '#F97316' }}>+12,4% vs período anterior</p>
        </div>

        {/* Receita Confirmada */}
        <div
          className="rounded-xl bg-surface-container-lowest p-5 border-l-4"
          style={{ borderLeftColor: '#2E7D32', boxShadow: '0 1px 8px -2px rgba(46,125,50,0.10)' }}
        >
          <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-1">Receita Confirmada</p>
          <p className="text-2xl font-black text-on-surface tabular-nums leading-none">{fmt(totalConfirmado)}</p>
          <p className="text-xs font-semibold mt-2 text-green-700">
            {totalProjetado > 0 ? Math.round((totalConfirmado / totalProjetado) * 100) : 0}% do total projetado
          </p>
        </div>

        {/* Nível de Confiança */}
        <div
          className="rounded-xl bg-surface-container-lowest p-5 border-l-4"
          style={{ borderLeftColor: '#006398', boxShadow: '0 1px 8px -2px rgba(0,99,152,0.10)' }}
        >
          <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-1">Nível de Confiança</p>
          <p className="text-2xl font-black text-on-surface tabular-nums leading-none">{confianca}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${confianca}%`, background: '#006398' }}
            />
          </div>
        </div>

        {/* Contratos em Projeção */}
        <div
          className="rounded-xl bg-surface-container-lowest p-5 border-l-4 border-l-surface-container-high"
          style={{ boxShadow: '0 1px 8px -2px rgba(0,0,0,0.05)' }}
        >
          <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-1">Contratos em Projeção</p>
          <p className="text-2xl font-black text-on-surface tabular-nums leading-none">{parcelas.length}</p>
          <p className="text-xs font-semibold mt-2 text-text-muted">
            {parcelas.filter(p => p.situacao === 'confirmado').length} confirmados
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BarChart mensal — span 2 */}
        <div
          className="lg:col-span-2 rounded-xl bg-surface-container-lowest p-6"
          style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}
        >
          <h3 className="text-sm font-bold text-on-surface mb-1">Receita Mensal Projetada</h3>
          <p className="text-xs text-text-muted mb-4">Confirmado vs Projetado por mês</p>

          <CustomLegend items={[
            { label: 'Confirmado', color: '#2E7D32' },
            { label: 'Projetado', color: '#FDBA74' },
          ]} />

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais} barGap={4} barCategoryGap="30%">
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtK}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value, name) => [fmt(value), name === 'confirmado' ? 'Confirmado' : 'Projetado']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E0C0B1', fontSize: 12 }}
                />
                <Bar dataKey="confirmado" fill="#2E7D32" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="projetado" fill="#FDBA74" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PieChart donut */}
        <div
          className="rounded-xl bg-surface-container-lowest p-6"
          style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}
        >
          <h3 className="text-sm font-bold text-on-surface mb-1">Mix de Receita</h3>
          <p className="text-xs text-text-muted mb-2">Por tipo de venda</p>

          <div className="relative flex items-center justify-center" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [fmt(value), name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E0C0B1', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-on-surface">{pctRecorrente}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Recorrente</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-text-muted font-semibold">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-bold text-on-surface tabular-nums">
                  {totalPie > 0 ? Math.round((d.value / totalPie) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barras horizontais por vendedor */}
      <div
        className="rounded-xl bg-surface-container-lowest p-6"
        style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}
      >
        <h3 className="text-sm font-bold text-on-surface mb-1">Receita por Vendedor</h3>
        <p className="text-xs text-text-muted mb-5">Confirmado + Projetado, ordenado por volume total</p>

        {vendedoresChart.length === 0 ? (
          <p className="text-sm text-text-muted italic">Nenhum dado para exibir com os filtros aplicados.</p>
        ) : (
          <div className="space-y-4">
            {vendedoresChart.map(v => (
              <div key={v.nome} className="flex items-center gap-4">
                <span className="w-36 text-sm font-semibold text-on-surface truncate flex-shrink-0">{v.nome}</span>
                <div className="flex-1 flex rounded overflow-hidden h-6" style={{ background: '#F3F4F6' }}>
                  {v.confirmado > 0 && (
                    <div
                      title={`Confirmado: ${fmt(v.confirmado)}`}
                      className="h-full transition-all duration-500"
                      style={{ width: `${(v.confirmado / maxVendedor) * 100}%`, background: '#2E7D32' }}
                    />
                  )}
                  {v.projetado > 0 && (
                    <div
                      title={`Projetado: ${fmt(v.projetado)}`}
                      className="h-full transition-all duration-500"
                      style={{ width: `${(v.projetado / maxVendedor) * 100}%`, background: '#FDBA74' }}
                    />
                  )}
                </div>
                <span className="w-32 text-right text-sm font-bold text-on-surface tabular-nums flex-shrink-0">
                  {fmt(v.total)}
                </span>
              </div>
            ))}
            <CustomLegend items={[
              { label: 'Confirmado', color: '#2E7D32' },
              { label: 'Projetado', color: '#FDBA74' },
            ]} />
          </div>
        )}
      </div>

      {/* Tabela de parcelas projetadas */}
      <div
        className="rounded-xl bg-surface-container-lowest overflow-hidden"
        style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}
      >
        <div className="px-6 py-4 bg-surface-container flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Parcelas Projetadas</h3>
            <p className="text-xs text-text-muted mt-0.5">{parcelas.length} registro{parcelas.length !== 1 ? 's' : ''} no horizonte selecionado</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border border-outline-variant text-xs font-semibold text-text-muted hover:bg-surface-container transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filtrar
            </button>
            <button className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border border-outline-variant text-xs font-semibold text-text-muted hover:bg-surface-container transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        <DataTable
          columns={COLUMNS}
          data={parcelas}
          keyField="id"
          sortable
        />
      </div>

      {/* Rodapé informativo */}
      <p className="text-xs text-text-muted italic text-center pb-2">
        Os valores projetados são estimativas baseadas em contratos vigentes e histórico de recebimentos. Não constituem garantia de receita futura.
        Atualizado em: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
      </p>
    </div>
  )
}
