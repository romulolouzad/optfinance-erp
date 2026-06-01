import contasFinanceiras from './contas-financeiras.json'
import centrosCusto from './centros-custo.json'
import parcelas from './parcelas.json'
import despesas from './despesas.json'
import movimentacoes from './movimentacoes.json'
import vendas from './vendas.json'
import contratos from './contratos.json'
import emprestimos from './emprestimos.json'
import clientes from './clientes.json'
import colaboradores from './colaboradores.json'
import fornecedores from './fornecedores.json'
import historico from './historico.json'
import faturasCartao from './faturas-cartao.json'
import comissoes from './comissoes.json'

export {
  contasFinanceiras,
  centrosCusto,
  parcelas,
  despesas,
  movimentacoes,
  vendas,
  contratos,
  emprestimos,
  clientes,
  colaboradores,
  fornecedores,
  historico,
  faturasCartao,
  comissoes,
}

// ===== Filter helpers =====

export function getContasAtivas() {
  return contasFinanceiras.filter(c => c.ativa)
}

export function getCentroCustoById(id) {
  return centrosCusto.find(c => c.id === id)
}

export function getCentrosAtivos() {
  return centrosCusto.filter(c => c.ativo)
}

export function getParcelasBySituacao(situacao) {
  return parcelas.filter(p => p.situacao === situacao)
}

export function getParcelasByCliente(clienteNome) {
  return parcelas.filter(p => p.clienteNome.toLowerCase().includes(clienteNome.toLowerCase()))
}

export function getParcelasVencidas() {
  return parcelas.filter(p => p.situacao === 'vencida')
}

export function getParcelasEmAberto() {
  return parcelas.filter(p => p.situacao === 'em-aberto')
}

export function getDespesasBySituacao(situacao) {
  return despesas.filter(d => d.situacao === situacao)
}

export function getDespesasByCategoria(categoria) {
  return despesas.filter(d => d.categoria === categoria)
}

export function getDespesasByCentroCusto(centroCustoId) {
  return despesas.filter(d => d.centroCustoId === centroCustoId)
}

export function getMovimentacoesByTipo(tipo) {
  return movimentacoes.filter(m => m.tipo === tipo)
}

export function getMovimentacoesByPeriodo(dataInicio, dataFim) {
  return movimentacoes.filter(m => m.data >= dataInicio && m.data <= dataFim)
}

export function getVendasBySituacao(situacao) {
  return vendas.filter(v => v.situacao === situacao)
}

export function getVendasAtivas() {
  return vendas.filter(v => v.situacao === 'ativa')
}

export function getVendasProjecao() {
  return vendas.filter(v => v.situacao === 'projecao')
}

export function getContratosBySituacao(situacao) {
  return contratos.filter(c => c.situacao === situacao)
}

export function getEmprestimosBySituacao(situacao) {
  return emprestimos.filter(e => e.situacao === situacao)
}

export function getClienteById(id) {
  return clientes.find(c => c.id === id)
}

export function getColaboradoresAtivos() {
  return colaboradores.filter(c => c.ativo)
}

export function getFornecedoresAtivos() {
  return fornecedores.filter(f => f.ativo)
}

export function getHistoricoByEntidade(entidade) {
  return historico.filter(h => h.entidade === entidade)
}

export function getHistoricoAcoesCriticas() {
  return historico.filter(h => h.tipoEvento === 'acao-critica')
}

export function getFaturaCartaoByMes(mesReferencia) {
  return faturasCartao.find(f => f.mesReferencia === mesReferencia)
}

// ===== Dashboard summaries =====

export function getSummaryFinanceiro() {
  const receitasMes = parcelas
    .filter(p => p.situacao === 'paga' && p.recebimento && p.recebimento.startsWith('2026-05'))
    .reduce((sum, p) => sum + p.valorRecebido, 0)

  const despesasMes = despesas
    .filter(d => d.situacao === 'paga' && d.competencia === '2026-05')
    .reduce((sum, d) => sum + d.valor, 0)

  const saldoTotal = contasFinanceiras.reduce((sum, c) => sum + c.saldoAtual, 0)

  const parcelasVencidas = parcelas.filter(p => p.situacao === 'vencida').length

  const aReceber = parcelas
    .filter(p => p.situacao === 'em-aberto' || p.situacao === 'pagamento-parcial')
    .reduce((sum, p) => sum + (p.valorBruto - p.valorRecebido), 0)

  const aPagar = despesas
    .filter(d => d.situacao === 'prevista')
    .reduce((sum, d) => sum + d.valor, 0)

  const saldoDevedor = emprestimos
    .filter(e => e.situacao !== 'quitado')
    .reduce((sum, e) => sum + e.saldoDevedor, 0)

  return {
    receitasMes,
    despesasMes,
    lucroMes: receitasMes - despesasMes,
    saldoTotal,
    parcelasVencidas,
    aReceber,
    aPagar,
    saldoDevedor,
  }
}
