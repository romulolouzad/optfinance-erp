import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import vendas from '../../data/vendas.json'

const STATUS_CONFIG = [
  { key: 'ativa',     label: 'Ativa',     color: '#22c55e' },
  { key: 'projecao',  label: 'Projeção',  color: '#d1d5db' },
  { key: 'inativa',   label: 'Inativa',   color: '#6b7280' },
  { key: 'perdida',   label: 'Perdida',   color: '#ef4444' },
  { key: 'encerrada', label: 'Encerrada', color: '#111827' },
]

function buildData() {
  const counts = {}
  STATUS_CONFIG.forEach(s => { counts[s.key] = 0 })
  vendas.forEach(v => {
    if (counts[v.situacao] !== undefined) counts[v.situacao]++
  })
  return STATUS_CONFIG.map(s => ({ ...s, value: counts[s.key] })).filter(d => d.value > 0)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-lg text-xs">
      <span className="font-bold text-on-surface">{d.label}: {d.value}</span>
    </div>
  )
}

export default function GraficoStatus() {
  const data  = buildData()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-on-surface">Distribuição por Status de Venda</h4>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              cx={75}
              cy={75}
              innerRadius={50}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-on-surface leading-none">{total}</span>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Total</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide flex-1 truncate">{d.label}</span>
              <span className="text-[11px] font-bold text-on-surface">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
