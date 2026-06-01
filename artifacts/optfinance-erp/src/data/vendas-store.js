import vendasData from './vendas.json'

export const vendas = [...vendasData]

export function addVenda(venda) {
  vendas.unshift(venda)
}

export function getNextVendaId() {
  const nums = vendas.map(v => parseInt(v.id.replace('VND', ''))).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `VND${String(next).padStart(3, '0')}`
}

export function getNextVendaNumero() {
  const nums = vendas.map(v => parseInt(v.numero)).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 60
  return String(next).padStart(4, '0')
}

export function getQtdParcelas(venda) {
  if (!venda.parcelas || venda.parcelas.length === 0) return 0
  const last = venda.parcelas[venda.parcelas.length - 1]
  const parts = (last.numero || '').split('/')
  return parts[1] ? parseInt(parts[1]) : venda.parcelas.length
}

export function getParcelasPagas(venda) {
  if (!venda.parcelas || venda.parcelas.length === 0) return 0
  return venda.parcelas.filter(p => p.situacao === 'paga').length
}

export function detectDuplicatas() {
  const map = {}
  vendas.forEach(v => {
    const key = `${v.clienteNome}|${v.valorTotal}|${v.competencia}`
    if (!map[key]) map[key] = []
    map[key].push(v.id)
  })
  const dupes = new Set()
  Object.values(map).forEach(ids => {
    if (ids.length > 1) ids.forEach(id => dupes.add(id))
  })
  return dupes
}
