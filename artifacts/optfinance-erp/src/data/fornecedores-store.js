import fornecedoresBase from './fornecedores.json'
import clientesBase from './clientes.json'

let _fornecedores = [...fornecedoresBase]
let _nextNum = _fornecedores.length + 1

export function getFornecedores() {
  return _fornecedores
}

export function addFornecedor(dados) {
  const padded = String(_nextNum).padStart(3, '0')
  const id = `FOR${padded}`
  _nextNum++
  const today = new Date().toISOString().split('T')[0]
  const entry = {
    ...dados,
    id,
    ativo: dados.status === 'ativo',
    despesasVinculadas: [],
    historico: [
      { data: today, acao: 'Cadastro de fornecedor', executor: 'Admin', tipo: 'manual' }
    ]
  }
  _fornecedores = [..._fornecedores, entry]
  return entry
}

export function isCnpjDuplicadoEmClientes(cnpj) {
  if (!cnpj) return false
  const normalizado = cnpj.replace(/\D/g, '')
  if (normalizado.length < 11) return false
  return clientesBase.some(c => c.cnpj && c.cnpj.replace(/\D/g, '') === normalizado)
}
