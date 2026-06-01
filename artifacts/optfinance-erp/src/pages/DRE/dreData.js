export const MONTHS = ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26']

const RAW_ROWS = [
  {
    id: 'receita-bruta',
    label: 'RECEITA BRUTA',
    type: 'parent',
    values: [150000, 165000, 172000, 185000],
    children: [
      { id: 'contratos-ativos', label: 'Receitas de Contratos Ativos', type: 'child', values: [120000, 130000, 135000, 145000] },
      { id: 'recorrentes', label: 'Receitas Recorrentes', type: 'child', values: [30000, 35000, 37000, 40000] },
    ],
  },
  {
    id: 'deducoes',
    label: '(−) DEDUÇÕES',
    type: 'parent',
    values: [-15000, -16500, -17200, -18500],
    children: [
      { id: 'impostos-receita', label: 'Impostos sobre Receita (ISS, PIS, COFINS)', type: 'child', values: [-15000, -16500, -17200, -18500] },
    ],
  },
  { id: 'sep-1', type: 'separator' },
  { id: 'receita-liquida', label: 'RECEITA LÍQUIDA', type: 'result-mid', derivedFrom: ['receita-bruta', 'deducoes'] },
  {
    id: 'custos-diretos',
    label: '(−) CUSTOS DIRETOS',
    type: 'parent',
    values: [-45000, -52000, -51000, -55000],
    children: [
      { id: 'comissoes', label: 'Comissões de Vendedores', type: 'child', values: [-12000, -14000, -15000, -16000] },
      { id: 'entrega-projeto', label: 'Custos de Entrega de Projeto', type: 'child', values: [-33000, -38000, -36000, -39000] },
    ],
  },
  { id: 'sep-2', type: 'separator' },
  { id: 'lucro-bruto', label: 'LUCRO BRUTO', type: 'result-mid', derivedFrom: ['receita-liquida', 'custos-diretos'] },
  {
    id: 'despesas-op',
    label: '(−) DESPESAS OPERACIONAIS',
    type: 'parent',
    values: [-42000, -42000, -43500, -45000],
    children: [
      { id: 'salarios', label: 'Salários e Encargos', type: 'child', values: [-30000, -30000, -31000, -32000] },
      { id: 'infra', label: 'Infraestrutura', type: 'child', values: [-5000, -5000, -5000, -5500] },
      { id: 'marketing', label: 'Marketing', type: 'child', values: [-4000, -4000, -4500, -4500] },
      { id: 'admin', label: 'Administrativo', type: 'child', values: [-3000, -3000, -3000, -3000] },
    ],
  },
  { id: 'sep-3', type: 'separator' },
  { id: 'ebitda', label: 'EBITDA', type: 'result-ebitda', derivedFrom: ['lucro-bruto', 'despesas-op'] },
  { id: 'depreciacao', label: '(−) Depreciação / Amortização', type: 'standalone', values: [-5000, -5000, -5000, -5000] },
  { id: 'lucro-op', label: 'LUCRO OPERACIONAL', type: 'result-mid', derivedFrom: ['ebitda', 'depreciacao'] },
  { id: 'resultado-fin', label: '(+/−) Resultado Financeiro', type: 'standalone', values: [-1200, -800, -950, -1100] },
  { id: 'sep-4', type: 'separator' },
  { id: 'lucro-liquido', label: 'LUCRO LÍQUIDO', type: 'result-final', derivedFrom: ['lucro-op', 'resultado-fin'] },
]

export function getTotal(values) {
  return values.reduce((s, v) => s + v, 0)
}

function deriveValues(id, resolved) {
  const row = RAW_ROWS.find(r => r.id === id)
  if (!row) return [0, 0, 0, 0]
  if (row.derivedFrom) {
    return row.derivedFrom.reduce((acc, srcId) => {
      const src = resolved[srcId] || deriveValues(srcId, resolved)
      return acc.map((v, i) => v + src[i])
    }, [0, 0, 0, 0])
  }
  return row.values || [0, 0, 0, 0]
}

export function buildDreRows() {
  const resolved = {}
  const rows = []

  for (const row of RAW_ROWS) {
    if (row.type === 'separator') {
      rows.push({ ...row })
      continue
    }

    let values
    if (row.derivedFrom) {
      values = row.derivedFrom.reduce((acc, srcId) => {
        const src = resolved[srcId] || [0, 0, 0, 0]
        return acc.map((v, i) => v + src[i])
      }, [0, 0, 0, 0])
    } else {
      values = row.values || [0, 0, 0, 0]
    }

    resolved[row.id] = values

    const built = { ...row, values }
    if (row.children) {
      built.children = row.children.map(c => ({ ...c }))
    }
    rows.push(built)
  }

  return rows
}

export function toCumulative(values) {
  const result = []
  let running = 0
  for (const v of values) {
    running += v
    result.push(running)
  }
  return result
}

export function applyVisualizacao(rows, mode) {
  if (mode === 'mensal') return rows
  return rows.map(row => {
    if (row.type === 'separator') return row
    const values = toCumulative(row.values)
    const children = row.children?.map(c => ({ ...c, values: toCumulative(c.values) }))
    return { ...row, values, ...(children ? { children } : {}) }
  })
}
