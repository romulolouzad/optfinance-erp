import PageHeader from '../../components/shared/PageHeader'
import { getSummaryFinanceiro, vendas, despesas } from '../../data/index'
import { BarChart3 } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const pct = (v, base) => base !== 0 ? `${((v / base) * 100).toFixed(1)}%` : '—'

export default function DrePage() {
  const receitaBruta = vendas
    .filter(v => v.situacao === 'ativa')
    .flatMap(v => v.parcelas.filter(p => p.situacao === 'paga'))
    .reduce((s, p) => s + p.valor, 0)

  const totalDeducoes = receitaBruta * 0.082
  const receitaLiquida = receitaBruta - totalDeducoes

  const custoServicos = despesas
    .filter(d => d.situacao === 'paga' && d.categoria === 'Salários')
    .reduce((s, d) => s + d.valor, 0)

  const lucroBruto = receitaLiquida - custoServicos

  const despOpex = despesas
    .filter(d => d.situacao === 'paga' && d.categoria !== 'Salários')
    .reduce((s, d) => s + d.valor, 0)

  const ebitda = lucroBruto - despOpex
  const impostos = ebitda * 0.15
  const lucroLiquido = ebitda - impostos

  const lines = [
    { label: 'RECEITA BRUTA DE SERVIÇOS', value: receitaBruta, bold: true, indent: 0 },
    { label: 'Impostos sobre serviços (ISS, PIS, COFINS)', value: -totalDeducoes, indent: 1 },
    { label: 'RECEITA LÍQUIDA', value: receitaLiquida, bold: true, indent: 0, accent: true },
    { label: 'CUSTO DOS SERVIÇOS PRESTADOS', value: -custoServicos, bold: true, indent: 0 },
    { label: 'Folha de pagamento equipe técnica', value: -custoServicos, indent: 1 },
    { label: 'LUCRO BRUTO', value: lucroBruto, bold: true, indent: 0, accent: true },
    { label: 'DESPESAS OPERACIONAIS', value: -despOpex, bold: true, indent: 0 },
    { label: 'Aluguel e infraestrutura', value: -(despOpex * 0.5), indent: 1 },
    { label: 'Marketing e vendas', value: -(despOpex * 0.2), indent: 1 },
    { label: 'TI e sistemas', value: -(despOpex * 0.2), indent: 1 },
    { label: 'Outros', value: -(despOpex * 0.1), indent: 1 },
    { label: 'EBITDA', value: ebitda, bold: true, indent: 0, accent: true },
    { label: 'Provisão para impostos (15%)', value: -impostos, indent: 1 },
    { label: 'LUCRO LÍQUIDO', value: lucroLiquido, bold: true, indent: 0, big: true, accent: true },
  ]

  return (
    <div>
      <PageHeader
        title="DRE — Demonstrativo de Resultado"
        subtitle="Período: Janeiro — Maio 2026 (acumulado)"
      />
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary-container" />
          <h3 className="text-sm font-bold text-on-surface">Demonstrativo de Resultados (Simulado)</h3>
        </div>
        <div className="divide-y divide-surface-container">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-6 py-3 ${line.accent ? 'bg-primary-container/5' : ''}`}
              style={{ paddingLeft: `${24 + line.indent * 20}px` }}
            >
              <span className={`text-sm ${line.bold ? 'font-bold text-on-surface' : 'text-text-muted'} ${line.big ? 'text-base' : ''}`}>
                {line.label}
              </span>
              <div className="text-right">
                <span className={`font-semibold tabular-nums ${line.value < 0 ? 'text-error' : 'text-green-700'} ${line.bold ? 'font-bold' : ''} ${line.big ? 'text-lg' : 'text-sm'}`}>
                  {fmt(line.value)}
                </span>
                <span className="ml-3 text-xs text-text-muted min-w-[60px] inline-block text-right">
                  {pct(Math.abs(line.value), receitaLiquida)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
