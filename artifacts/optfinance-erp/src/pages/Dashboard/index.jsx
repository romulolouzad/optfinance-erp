import { TrendingUp, DollarSign, CheckCircle, Award, BarChart2 } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import GraficoReceita from './GraficoReceita'
import GraficoClientes from './GraficoClientes'
import GraficoStatus from './GraficoStatus'
import GraficoMetas from './GraficoMetas'
import vendas from '../../data/vendas.json'
import parcelas from '../../data/parcelas.json'
import despesas from '../../data/despesas.json'
import comissoes from '../../data/comissoes.json'

const MES_ATUAL  = '2026-05'
const MES_ANT    = '2026-04'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

function pctDelta(current, prior) {
  if (!prior || prior === 0) return null
  return Math.round(((current - prior) / prior) * 100)
}

function calcKpis() {
  const vendasAtivas = vendas.filter(v => v.situacao === 'ativa')
  const totalAtivas  = vendasAtivas.length
  const faturamentoBruto = vendasAtivas.reduce((s, v) => s + v.valorTotal, 0)

  const vendasAtivasAnt  = vendas.filter(v => v.situacao === 'ativa' && v.competencia <= MES_ANT)
  const totalAtivasAnt   = vendasAtivasAnt.length
  const fatBrutoAnt      = vendasAtivasAnt.reduce((s, v) => s + v.valorTotal, 0)

  const recebidoMes = parcelas
    .filter(p => p.situacao === 'paga' && p.recebimento && p.recebimento.startsWith(MES_ATUAL))
    .reduce((s, p) => s + p.valorRecebido, 0)

  const recebidoMesAnt = parcelas
    .filter(p => p.situacao === 'paga' && p.recebimento && p.recebimento.startsWith(MES_ANT))
    .reduce((s, p) => s + p.valorRecebido, 0)

  const comissoesPagar    = comissoes
    .filter(c => c.status === 'pronta' || c.status === 'aguardando-nf')
    .reduce((s, c) => s + c.valor, 0)

  const comissoesPagarAnt = comissoes
    .filter(c => (c.status === 'pronta' || c.status === 'aguardando-nf') && c.competencia <= MES_ANT)
    .reduce((s, c) => s + c.valor, 0)

  const despMes = despesas
    .filter(d => d.situacao === 'paga' && d.competencia === MES_ATUAL)
    .reduce((s, d) => s + d.valor, 0)

  const despAnt = despesas
    .filter(d => d.situacao === 'paga' && d.competencia === MES_ANT)
    .reduce((s, d) => s + d.valor, 0)

  const margem    = recebidoMes  > 0 ? Math.round(((recebidoMes  - despMes) / recebidoMes)  * 100) : 0
  const margemAnt = recebidoMesAnt > 0 ? Math.round(((recebidoMesAnt - despAnt) / recebidoMesAnt) * 100) : null

  return {
    totalAtivas,
    faturamentoBruto,
    recebidoMes,
    comissoesPagar,
    margem,
    despMes,
    deltaAtivas:        pctDelta(totalAtivas, totalAtivasAnt),
    deltaFaturamento:   pctDelta(faturamentoBruto, fatBrutoAnt),
    deltaRecebido:      pctDelta(recebidoMes, recebidoMesAnt),
    deltaComissoes:     pctDelta(comissoesPagar, comissoesPagarAnt),
    deltaMargem:        margemAnt !== null ? margem - margemAnt : null,
  }
}

function DeltaTag({ pct, positiveGood = true, isPoints = false }) {
  if (pct === null || pct === undefined) return null
  const isPos = pct >= 0
  const color = positiveGood
    ? (isPos ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50')
    : (isPos ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50')
  const sign = isPos ? '+' : ''
  const suffix = isPoints ? 'pp' : '%'
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${color}`}>
      {sign}{pct}{suffix}
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, delta, deltaPoints, positiveGood = true, deltaLabel, iconBg, iconColor }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {deltaPoints !== undefined && deltaPoints !== null
          ? <DeltaTag pct={deltaPoints} positiveGood={positiveGood} isPoints />
          : <DeltaTag pct={delta} positiveGood={positiveGood} />
        }
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-on-surface leading-none">{value}</p>
      </div>
      {deltaLabel && (
        <p className="text-[10px] text-text-muted leading-tight">{deltaLabel}</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const kpis = calcKpis()

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral do negócio"
        />

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              icon={TrendingUp}
              label="Total de Vendas Ativas"
              value={kpis.totalAtivas}
              delta={kpis.deltaAtivas}
              iconBg="#FFF7ED"
              iconColor="#F97316"
              deltaLabel="vs. mês anterior"
            />
            <KpiCard
              icon={DollarSign}
              label="Faturamento Bruto"
              value={fmt(kpis.faturamentoBruto)}
              delta={kpis.deltaFaturamento}
              iconBg="#F3F4F6"
              iconColor="#374151"
              deltaLabel="vs. mês anterior"
            />
            <KpiCard
              icon={CheckCircle}
              label="Recebido no Mês"
              value={fmt(kpis.recebidoMes)}
              delta={kpis.deltaRecebido}
              iconBg="#F0FDF4"
              iconColor="#16a34a"
              deltaLabel="vs. mês anterior"
            />
            <KpiCard
              icon={Award}
              label="Comissões a Pagar"
              value={fmt(kpis.comissoesPagar)}
              delta={kpis.deltaComissoes}
              positiveGood={false}
              iconBg="#FFFBEB"
              iconColor="#D97706"
              deltaLabel="vs. mês anterior"
            />
            <KpiCard
              icon={BarChart2}
              label="Margem Média"
              value={`${kpis.margem}%`}
              deltaPoints={kpis.deltaMargem}
              iconBg="#F3F4F6"
              iconColor="#374151"
              deltaLabel={`Receita − ${fmt(kpis.despMes)} despesas`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4" style={{ minHeight: 300 }}>
            <div className="lg:col-span-6">
              <GraficoReceita />
            </div>
            <div className="lg:col-span-4">
              <GraficoClientes />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4" style={{ minHeight: 280 }}>
            <div className="lg:col-span-4">
              <GraficoStatus />
            </div>
            <div className="lg:col-span-6">
              <GraficoMetas />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 pt-5 pb-2 border-t border-surface-container-high">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-xs text-text-muted font-medium">© 2026 OPTSOLV ERP</span>
          <a href="#" className="text-xs text-text-muted hover:text-on-surface transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-text-muted hover:text-on-surface transition-colors">Terms of Service</a>
          <a href="#" className="text-xs text-text-muted hover:text-on-surface transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  )
}
