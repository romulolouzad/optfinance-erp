import comissoes from '../../data/comissoes.json'

function fmtValor(v) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `R$ ${(v / 1000).toFixed(0)}k`
  return `R$ ${v.toFixed(0)}`
}

export default function GraficoMetas() {
  const metas   = comissoes.filter(c => c.tipo === 'meta')
  const maxMeta = Math.max(...metas.map(m => m.meta))

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-on-surface">Metas x Realizado por Vendedor</h4>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-surface-container-highest" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Meta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary-container" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Realizado</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-5">
        {metas.map((m, i) => {
          const pct        = Math.round((m.realizado / m.meta) * 100)
          const metaBarPct = (m.meta / maxMeta) * 100
          const realBarPct = Math.min((m.realizado / m.meta) * metaBarPct, metaBarPct)
          const isAbove    = pct >= 100

          return (
            <div key={i} className="flex items-center gap-4">
              <span className="w-24 text-[11px] font-bold text-on-surface uppercase tracking-wide flex-shrink-0 truncate">
                {m.vendedor}
              </span>
              <div className="flex-1">
                <div className="relative h-2 rounded-full bg-surface-container overflow-visible">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ width: `${metaBarPct}%`, backgroundColor: '#d1d5db' }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-primary-container z-10"
                    style={{ width: `${realBarPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-text-muted">{fmtValor(m.realizado)}</span>
                  <span className="text-[9px] text-text-muted">{fmtValor(m.meta)}</span>
                </div>
              </div>
              <span
                className="w-10 text-[11px] font-bold text-right flex-shrink-0"
                style={{ color: isAbove ? '#16a34a' : '#F97316' }}
              >
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
