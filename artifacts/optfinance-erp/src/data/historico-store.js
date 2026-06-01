import historicoBase from './historico.json'

let _historico = [...historicoBase]
let _nextNum = _historico.length + 1

export function getHistorico() {
  return _historico
}

export function addHistorico({ acao, tipoEvento = 'normal', entidade = 'Sistema', entidadeId = '', detalhes = '', camposAlterados = [] }) {
  const padded = String(_nextNum).padStart(3, '0')
  const id = `HIS${padded}`
  _nextNum++
  const now = new Date()
  const entry = {
    id,
    dataHora: now.toISOString().slice(0, 19),
    entidade,
    entidadeId,
    tipoEvento,
    usuario: 'admin@optsolv.com',
    usuarioId: 'USR001',
    descricaoCompleta: acao,
    detalhes,
    camposAlterados,
    ipCliente: '192.168.1.1',
    empresa: 'Optsolv',
    filial: 'São Paulo',
  }
  _historico = [entry, ..._historico]
  return entry
}

export const registrarHistorico = addHistorico
