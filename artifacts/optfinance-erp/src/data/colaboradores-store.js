import colaboradoresBase from './colaboradores.json'

let _colaboradores = [...colaboradoresBase]
let _nextNum = _colaboradores.length + 1

export function getColaboradores() {
  return _colaboradores
}

export function addColaborador(dados) {
  if (!dados?.centroCustoId) throw new Error('centroCustoId é obrigatório para colaboradores')
  const padded = String(_nextNum).padStart(3, '0')
  const id = `COL${padded}`
  _nextNum++
  const today = new Date().toISOString().split('T')[0]
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const entry = {
    ...dados,
    id,
    ultimoAcesso: today,
    despesasRecentes: [],
    historicoAlteracoes: [
      { acao: 'Cadastro de colaborador', data: today, hora, usuario: 'Admin' }
    ]
  }
  _colaboradores = [..._colaboradores, entry]
  return entry
}
