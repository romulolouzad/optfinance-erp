import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import parcelas from '../../data/parcelas.json'

const MESES  = ['2026-01', '2026-02', '2026-03', '2026-04']
const LABELS = { '2026-01': 'Jan', '2026-02': 'Fev', '2026-03': 'Mar', '2026-04': 'Abr' }

function fmtCompact(v) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `R$ ${(v / 1000).toFixed(0)}k`
  return `R$ ${v.toFixed(0)}`
}

function fmtTooltip(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function buildData() {
  const realizadoMap  = {}
  const projetadoMap  = {}
  MESES.forEach(m => { realizadoMap[m] = 0; projetadoMap[m] = 0 })

  parcelas.forEach(p => {
    if ((p.situacao === 'paga' || p.situacao === 'pagamento-parcial') && MESES.includes(p.competencia)) {
      realizadoMap[p.competencia] += p.valorRecebido
    }
    if (p.situacao === 'projetado' && MESES.includes(p.competencia)) {
      projetadoMap[p.competencia] += p.valorBruto
    }
  })

  return MESES.map(mes => ({
    mes:       LABELS[mes],
    realizado: Math.round(realizadoMap[mes]),
    projetado: Math.round(projetadoMap[mes]),
  }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 shadow-lg text-xs">
      <p className="font-bold text-on-surface mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: {fmtTooltip(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function GraficoReceita() {
  const data = buildData()

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-on-surface">Receita Realizada vs Projetada por Mês</h4>
          <p className="text-xs text-text-muted mt-0.5">Dados consolidados Jan–Abr/2026</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] bg-[#F97316] rounded-full" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Realizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full" style={{ background: '#FDBA74' }} />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Projetado</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9EDFF" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtCompact}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="realizado"
              name="Realizado"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="projetado"
              name="Projetado"
              stroke="#FDBA74"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: '#FDBA74', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
