import clientesBase from './clientes.json'

let _clientes = [...clientesBase]
let _nextNum = _clientes.length + 1

export function getClientes() {
  return _clientes
}

export function addCliente(dadosCliente) {
  if (!dadosCliente?.centroCustoId) throw new Error('centroCustoId é obrigatório para clientes')
  const padded = String(_nextNum).padStart(3, '0')
  const id = `CLI${padded}`
  _nextNum++
  const today = new Date().toISOString().split('T')[0]
  const entry = {
    ...dadosCliente,
    id,
    contratos: [],
    contratosVinculados: [],
    historico: [
      { data: today, acao: 'Cadastro de cliente', usuario: 'Admin' }
    ]
  }
  _clientes = [..._clientes, entry]
  return entry
}

export function isCnpjDuplicado(cnpj) {
  if (!cnpj) return false
  const normalizado = cnpj.replace(/\D/g, '')
  if (normalizado.length < 14) return false
  return _clientes.some(c => c.cnpj.replace(/\D/g, '') === normalizado)
}
