import { useState, Fragment } from 'react'
import { ChevronDown, ChevronRight, FileText, FileImage } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import PrintHeader from '../../components/shared/PrintHeader'
import NoPermissionState from '../../components/shared/NoPermissionState'
import { MONTHS, getTotal, buildDreRows, applyVisualizacao } from './dreData'
import { useAuth } from '../../context/AuthContext'

function formatVal(value) {
  if (value === 0) return 'R$ 0,00'
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(abs)
  return value < 0 ? `R$ -${formatted.replace(/^R\$\s*/, '')}` : formatted
}

function SeparatorRow({ colCount }) {
  return (
    <tr>
      <td colSpan={colCount} className="px-6 py-0">
        <div className="text-slate-300 text-[10px] tracking-[0.15em] select-none py-0.5 overflow-hidden whitespace-nowrap">
          {'━'.repeat(120)}
        </div>
      </td>
    </tr>
  )
}

function ParentRow({ row, expanded, onToggle }) {
  const total = getTotal(row.values)
  return (
    <tr className="hover:bg-[#FFF7ED]/40 transition-colors">
      <td className="py-4 px-6 font-bold">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-left w-full"
        >
          {expanded
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          }
          <span>{row.label}</span>
        </button>
      </td>
      {row.values.map((v, i) => (
        <td key={i} className={`py-4 px-6 text-right font-bold tabular-nums ${v < 0 ? 'text-error' : ''}`}>
          {formatVal(v)}
        </td>
      ))}
      <td className={`py-4 px-6 text-right font-bold tabular-nums ${total < 0 ? 'text-error' : ''}`}>
        {formatVal(total)}
      </td>
    </tr>
  )
}

function ChildRow({ row }) {
  const total = getTotal(row.values)
  return (
    <tr className="text-slate-500 hover:bg-slate-50/60 transition-colors">
      <td className="py-3 px-6 pl-14 text-sm">{row.label}</td>
      {row.values.map((v, i) => (
        <td key={i} className="py-3 px-6 text-right text-sm tabular-nums">{formatVal(v)}</td>
      ))}
      <td className="py-3 px-6 text-right text-sm font-medium tabular-nums">{formatVal(total)}</td>
    </tr>
  )
}

function ResultMidRow({ row }) {
  const total = getTotal(row.values)
  return (
    <tr className="bg-surface-container-low border-l-4 border-primary-container">
      <td className="py-4 px-6 font-black tracking-tight">{row.label}</td>
      {row.values.map((v, i) => (
        <td key={i} className="py-4 px-6 text-right font-black tabular-nums">{formatVal(v)}</td>
      ))}
      <td className="py-4 px-6 text-right font-black tabular-nums">{formatVal(total)}</td>
    </tr>
  )
}

function EbitdaRow({ row }) {
  const total = getTotal(row.values)
  return (
    <tr className="bg-[#FFF7ED]">
      <td className="py-5 px-6 font-black tracking-tight text-primary">{row.label}</td>
      {row.values.map((v, i) => (
        <td key={i} className="py-5 px-6 text-right font-black text-primary tabular-nums">{formatVal(v)}</td>
      ))}
      <td className="py-5 px-6 text-right font-black text-primary tabular-nums">{formatVal(total)}</td>
    </tr>
  )
}

function StandaloneRow({ row }) {
  const total = getTotal(row.values)
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-4 px-6 font-bold">{row.label}</td>
      {row.values.map((v, i) => (
        <td key={i} className={`py-4 px-6 text-right font-medium tabular-nums ${v < 0 ? 'text-error' : ''}`}>{formatVal(v)}</td>
      ))}
      <td className={`py-4 px-6 text-right font-medium tabular-nums ${total < 0 ? 'text-error' : ''}`}>{formatVal(total)}</td>
    </tr>
  )
}

function LucroLiquidoRow({ row }) {
  const total = getTotal(row.values)
  return (
    <tr className="bg-[#1F2937] text-white">
      <td className="py-6 px-6 font-black text-lg tracking-tight text-white">{row.label}</td>
      {row.values.map((v, i) => (
        <td key={i} className="py-6 px-6 text-right font-black text-lg text-green-400 tabular-nums">{formatVal(v)}</td>
      ))}
      <td className="py-6 px-6 text-right font-black text-lg text-green-400 tabular-nums">{formatVal(total)}</td>
    </tr>
  )
}

const COL_COUNT = MONTHS.length + 2

export default function DrePage() {
  const { temPermissao } = useAuth()
  const baseRows = buildDreRows()

  const [expanded, setExpanded] = useState(() => {
    const map = {}
    baseRows.forEach(row => { if (row.children) map[row.id] = true })
    return map
  })
  const [visualizacao, setVisualizacao] = useState('mensal')

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const rows = applyVisualizacao(baseRows, visualizacao)

  const receitaBruta = baseRows.find(r => r.id === 'receita-bruta')
  const lucroLiquido = baseRows.find(r => r.id === 'lucro-liquido')
  const despesasOp = baseRows.find(r => r.id === 'despesas-op')

  const totalReceitaBruta = getTotal(receitaBruta.values)
  const totalLucroLiquido = getTotal(lucroLiquido.values)
  const totalDespesasOp = Math.abs(getTotal(despesasOp.values))
  const nMeses = MONTHS.length

  const margemLiquida = totalReceitaBruta !== 0
    ? ((totalLucroLiquido / totalReceitaBruta) * 100).toFixed(1)
    : '0.0'
  const burnRateK = `R$ ${Math.round(totalDespesasOp / nMeses / 1000)}k`

  if (!temPermissao('dre', 'visualizar')) return <NoPermissionState message="Você não tem permissão para acessar o DRE Gerencial." />

  return (
    <div className="flex flex-col gap-6">
      <PrintHeader titulo="DRE Gerencial — Demonstrativo de Resultado do Exercício" />

      {/* Context topbar — DRE Report title + sub-tabs */}
      <div className="flex items-center gap-6 -mb-2">
        <h2 className="text-slate-900 font-black text-lg">DRE Report</h2>
        <nav className="flex items-center gap-6 ml-4">
          <span className="text-primary-container font-semibold text-sm border-b-2 border-primary-container pb-0.5 cursor-pointer">
            DRE
          </span>
          <span className="text-slate-400 font-medium text-sm cursor-pointer hover:text-primary-container transition-colors">
            Fluxo de Caixa
          </span>
          <span className="text-slate-400 font-medium text-sm cursor-pointer hover:text-primary-container transition-colors">
            Conciliação
          </span>
        </nav>
      </div>

      <PageHeader
        title="DRE"
        subtitle="Demonstrativo de Resultado do Exercício"
      />

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Período</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2 bg-surface-container-low rounded-lg border border-transparent focus-within:border-primary-container transition-all">
              <span className="text-[10px] font-bold text-slate-400 mr-2">DE</span>
              <input
                className="bg-transparent border-none p-0 text-sm font-bold w-20 focus:ring-0 outline-none"
                type="text"
                defaultValue="Jan/2026"
              />
            </div>
            <div className="flex items-center px-3 py-2 bg-surface-container-low rounded-lg border border-transparent focus-within:border-primary-container transition-all">
              <span className="text-[10px] font-bold text-slate-400 mr-2">ATÉ</span>
              <input
                className="bg-transparent border-none p-0 text-sm font-bold w-20 focus:ring-0 outline-none"
                type="text"
                defaultValue="Abr/2026"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Centro de Custo</label>
          <div className="relative">
            <select className="appearance-none bg-surface-container-low border-none rounded-lg px-4 py-2 pr-10 text-sm font-bold focus:ring-2 focus:ring-primary-container/20 w-48 cursor-pointer">
              <option>Todos os Centros</option>
              <option>Operacional</option>
              <option>Marketing</option>
              <option>P&amp;D</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Visualização</label>
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            <button
              onClick={() => setVisualizacao('mensal')}
              className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${visualizacao === 'mensal' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-on-surface'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setVisualizacao('acumulado')}
              className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${visualizacao === 'acumulado' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-on-surface'}`}
            >
              Acumulado
            </button>
          </div>
        </div>

        <div className="ml-auto flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-all border border-slate-200">
            <FileText className="w-4 h-4" />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-all border border-slate-200">
            <FileImage className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* DRE Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[300px]">Categoria</th>
              {MONTHS.map(m => (
                <th key={m} className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">{m}</th>
              ))}
              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-900 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.map(row => {
              if (row.type === 'separator') {
                return <SeparatorRow key={row.id} colCount={COL_COUNT} />
              }
              if (row.type === 'parent') {
                const isExp = expanded[row.id]
                return (
                  <Fragment key={row.id}>
                    <ParentRow row={row} expanded={isExp} onToggle={() => toggle(row.id)} />
                    {isExp && row.children?.map(child => (
                      <ChildRow key={child.id} row={child} />
                    ))}
                  </Fragment>
                )
              }
              if (row.type === 'result-mid') return <ResultMidRow key={row.id} row={row} />
              if (row.type === 'result-ebitda') return <EbitdaRow key={row.id} row={row} />
              if (row.type === 'standalone') return <StandaloneRow key={row.id} row={row} />
              if (row.type === 'result-final') return <LucroLiquidoRow key={row.id} row={row} />
              return null
            })}
          </tbody>
        </table>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        {/* Margem Líquida Média */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Margem Líquida Média</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-on-surface">{margemLiquida}%</span>
            <span className="text-emerald-500 font-bold text-sm mb-1">↑ 4.2%</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary-container h-full rounded-full transition-all"
              style={{ width: `${Math.min(parseFloat(margemLiquida), 100)}%` }}
            />
          </div>
        </div>

        {/* Burn Rate Operacional */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Burn Rate Operacional</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-on-surface">{burnRateK}</span>
            <span className="text-slate-400 font-bold text-sm mb-1">Estável</span>
          </div>
          <div className="flex gap-1 h-8 items-end">
            <div className="flex-1 bg-slate-200 h-1/2 rounded-t-sm" />
            <div className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: '66%' }} />
            <div className="flex-1 bg-slate-200 h-1/2 rounded-t-sm" />
            <div className="flex-1 bg-primary-container rounded-t-sm" style={{ height: '75%' }} />
          </div>
        </div>

        {/* Projeção Próximo Mês */}
        <div className="bg-[#1F2937] p-6 rounded-xl shadow-lg flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Projeção Próximo Mês</span>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white">R$ 68k</span>
            <span className="text-primary-container font-bold text-sm mb-1">+12%</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Estimativa baseada no pipeline atual de vendas e contratos recorrentes.
          </p>
        </div>
      </div>
    </div>
  )
}
