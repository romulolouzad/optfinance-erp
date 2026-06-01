import configuracoes from './configuracoes.json'

let _impostos = { ...configuracoes.impostos }

export function getImpostos() {
  return { ..._impostos }
}

export function setImpostos(novosImpostos) {
  _impostos = { ..._impostos, ...novosImpostos }
}
