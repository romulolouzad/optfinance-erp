import parcelas from '../../data/parcelas.json'

function fmtValor(v) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`
  return `R$ ${v.toFixed(0)}`
}

function buildTopClients() {
  const byClient = {}
  parcelas.forEach(p => {
    if (p.situacao === 'paga' || p.situacao === 'pagamento-parcial') {
      byClient[p.clienteNome] = (byClient[p.clienteNome] || 0) + p.valorRecebido
    }
  })
  return Object.entries(byClient)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([nome, valor]) => ({ nome, valor }))
}

export default function GraficoClientes() {
  const clientes = buildTopClients()
  const maxValor = clientes[0]?.valor || 1

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="mb-6">
        <h4 className="text-sm font-bold text-on-surface">Faturamento por Cliente</h4>
        <p className="text-xs text-text-muted mt-0.5">Principais contas — acumulado</p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-5">
        {clientes.map((c, i) => {
          const pct = (c.valor / maxValor) * 100
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wide truncate pr-2">
                  {c.nome}
                </span>
                <span className="text-[11px] font-bold text-text-muted flex-shrink-0">
                  {fmtValor(c.valor)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-container transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
