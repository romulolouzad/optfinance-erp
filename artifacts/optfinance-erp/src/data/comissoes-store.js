import comissoesBase from './comissoes.json'

let _comissoes = [...comissoesBase]

export function getComissoes() {
  return _comissoes
}

export function pausarComissoesFuturas(nomeVendedor) {
  const hoje = new Date().toISOString().slice(0, 7)
  _comissoes = _comissoes.map(c => {
    const isFutura = c.competencia >= hoje
    const isVendedor = c.vendedor.toLowerCase().includes(nomeVendedor.split(' ')[0].toLowerCase())
    const naoFinalizada = !['paga', 'cancelada'].includes(c.status)
    if (isFutura && isVendedor && naoFinalizada) {
      return { ...c, status: 'pausada' }
    }
    return c
  })
  return _comissoes.filter(
    c => c.status === 'pausada' && c.vendedor.toLowerCase().includes(nomeVendedor.split(' ')[0].toLowerCase())
  ).length
}
