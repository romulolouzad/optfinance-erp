
let _contaIdSeq = 5

const _contasBase = [
  {
    id: 'CF001',
    numero: '#001',
    nome: 'Principal Bradesco',
    banco: 'Bradesco',
    agencia: '4500-1',
    conta: '123456-7',
    cnpjTitular: '12.345.678/0001-90',
    saldoInicial: 50000.00,
    saldoAtual: 842120.50,
    dataAbertura: '2021-03-15',
    ultimaConciliacao: '2026-05-31',
    ativa: true,
    contaPadrao: true,
  },
  {
    id: 'CF002',
    numero: '#002',
    nome: 'Reserva Itaú',
    banco: 'Itaú Unibanco',
    agencia: '0900',
    conta: '98765-4',
    cnpjTitular: '12.345.678/0001-90',
    saldoInicial: 100000.00,
    saldoAtual: 403549.92,
    dataAbertura: '2022-01-10',
    ultimaConciliacao: '2026-05-28',
    ativa: true,
    contaPadrao: false,
  },
  {
    id: 'CF003',
    numero: '#003',
    nome: 'Conta Investimento XP',
    banco: 'XP Invest',
    agencia: '0001',
    conta: '554433-2',
    cnpjTitular: '12.345.678/0001-90',
    saldoInicial: 0.00,
    saldoAtual: 0.00,
    dataAbertura: '2023-06-20',
    ultimaConciliacao: '2026-05-20',
    ativa: false,
    contaPadrao: false,
  },
  {
    id: 'CF004',
    numero: '#004',
    nome: 'BTG Empresarial',
    banco: 'BTG Pactual',
    agencia: '0203',
    conta: '887744-1',
    cnpjTitular: '12.345.678/0001-90',
    saldoInicial: 200000.00,
    saldoAtual: 1245670.42,
    dataAbertura: '2020-08-01',
    ultimaConciliacao: '2026-06-01',
    ativa: true,
    contaPadrao: false,
  },
  {
    id: 'CF005',
    numero: '#005',
    nome: 'Caixa Físico Matriz',
    banco: 'Caixa Interna',
    agencia: '-',
    conta: '-',
    cnpjTitular: '12.345.678/0001-90',
    saldoInicial: 5000.00,
    saldoAtual: 3280.00,
    dataAbertura: '2021-01-02',
    ultimaConciliacao: '2026-06-01',
    ativa: true,
    contaPadrao: false,
  },
]

export let contas = [..._contasBase]

export const movimentacoesPorConta = {
  CF001: [
    { data: '15 Out', tipo: 'Entrada', origem: 'Venda Serv.', valor: 1200.00, saldo: 145280 },
    { data: '14 Out', tipo: 'Saída', origem: 'Aluguel', valor: -4500.00, saldo: 144080 },
    { data: '12 Out', tipo: 'Ajuste', origem: 'Taxas', valor: -25.00, saldo: 148580 },
    { data: '10 Out', tipo: 'Entrada', origem: 'Pix Rec.', valor: 850.00, saldo: 148605 },
    { data: '08 Out', tipo: 'Saída', origem: 'Internet', valor: -199.90, saldo: 147755 },
  ],
  CF002: [
    { data: '14 Out', tipo: 'Entrada', origem: 'TED Recebido', valor: 12000.00, saldo: 403549 },
    { data: '10 Out', tipo: 'Saída', origem: 'Fornecedor', valor: -8500.00, saldo: 391549 },
    { data: '05 Out', tipo: 'Entrada', origem: 'Parcela Cliente', valor: 5200.00, saldo: 400049 },
    { data: '01 Out', tipo: 'Ajuste', origem: 'Juros', valor: 180.30, saldo: 394849 },
    { data: '28 Set', tipo: 'Saída', origem: 'Imposto', valor: -3200.00, saldo: 394669 },
  ],
  CF003: [],
  CF004: [
    { data: '01 Jun', tipo: 'Entrada', origem: 'Aplicação', valor: 50000.00, saldo: 1245670 },
    { data: '28 Mai', tipo: 'Saída', origem: 'Retirada', valor: -20000.00, saldo: 1195670 },
    { data: '15 Mai', tipo: 'Entrada', origem: 'Rendimento', valor: 8420.00, saldo: 1215670 },
    { data: '10 Mai', tipo: 'Entrada', origem: 'TED Recebido', valor: 30000.00, saldo: 1207250 },
    { data: '05 Mai', tipo: 'Saída', origem: 'Transferência', valor: -10000.00, saldo: 1177250 },
  ],
  CF005: [
    { data: '31 Mai', tipo: 'Entrada', origem: 'Depósito', valor: 500.00, saldo: 3280 },
    { data: '28 Mai', tipo: 'Saída', origem: 'Compras', valor: -320.00, saldo: 2780 },
    { data: '20 Mai', tipo: 'Entrada', origem: 'Reembolso', valor: 100.00, saldo: 3100 },
    { data: '15 Mai', tipo: 'Saída', origem: 'Táxi', valor: -80.00, saldo: 3000 },
    { data: '10 Mai', tipo: 'Entrada', origem: 'Caixa Geral', valor: 1000.00, saldo: 3080 },
  ],
}

export const movimentacoesFuturas = {
  CF001: 3,
  CF002: 7,
  CF003: 0,
  CF004: 5,
  CF005: 0,
}

export const linhasExtrato = [
  { id: 'LE001', data: '12/10/2023', descricao: 'PAGTO FORNECEDOR ACME LTDA', valor: -1250.00, doc: '882910', vinculado: false, tipoVinculo: '', parcelaId: '', valorTitulo: 0 },
  { id: 'LE002', data: '13/10/2023', descricao: 'VENDAS CARTAO DEBITO REDE: 10293', valor: 4822.50, doc: '10293', vinculado: true, tipoVinculo: 'Parcela', parcelaId: 'PAR001', valorTitulo: 4822.50 },
  { id: 'LE003', data: '13/10/2023', descricao: 'TARIFA MANUT BANCARIA AUTO: 99211', valor: -45.00, doc: '99211', vinculado: true, tipoVinculo: 'Despesa', parcelaId: 'DESP001', valorTitulo: 45.00 },
  { id: 'LE004', data: '14/10/2023', descricao: 'PAGTO FORNECEDOR BRAVO CIA', valor: -3200.00, doc: '114320', vinculado: false, tipoVinculo: '', parcelaId: '', valorTitulo: 0 },
  { id: 'LE005', data: '15/10/2023', descricao: 'PIX RECEBIDO CLIENTE XYZ', valor: 7500.00, doc: '998812', vinculado: false, tipoVinculo: '', parcelaId: '', valorTitulo: 0 },
  { id: 'LE006', data: '16/10/2023', descricao: 'IOF OPERACAO CAMBIAL', valor: -88.20, doc: '221001', vinculado: false, tipoVinculo: '', parcelaId: '', valorTitulo: 0 },
  { id: 'LE007', data: '17/10/2023', descricao: 'TED RECEBIDO PARCEIRO LOGISTICA', valor: 12450.00, doc: '334421', vinculado: true, tipoVinculo: 'Parcela', parcelaId: 'PAR002', valorTitulo: 12450.00 },
]

export const lancamentosConfirmados = [
  { data: '12 Out 2023', descricaoBancaria: 'PAGTO FORNECEDOR ABC', doc: '882910', categoriaERP: 'Insumos de Produção', categoriaCor: '#EF4444', valor: -12450.00, efeitos: ['Redução DRE', 'Saída de Caixa'] },
  { data: '13 Out 2023', descricaoBancaria: 'VENDAS CARTAO DEBITO', doc: '10293', categoriaERP: 'Receita Operacional', categoriaCor: '#22C55E', valor: 4822.50, efeitos: ['Aumento DRE', 'Entrada de Caixa'] },
  { data: '13 Out 2023', descricaoBancaria: 'TARIFA MANUT BANCARIA', doc: '99211', categoriaERP: 'Despesas Administrativas', categoriaCor: '#6B7280', valor: -45.00, efeitos: ['Redução DRE'] },
  { data: '14 Out 2023', descricaoBancaria: 'PAGTO FORNECEDOR BRAVO CIA', doc: '114320', categoriaERP: 'Insumos de Produção', categoriaCor: '#EF4444', valor: -3200.00, efeitos: ['Redução DRE', 'Saída de Caixa'] },
  { data: '17 Out 2023', descricaoBancaria: 'TED RECEBIDO PARCEIRO', doc: '334421', categoriaERP: 'Receita Operacional', categoriaCor: '#22C55E', valor: 12450.00, efeitos: ['Aumento DRE', 'Entrada de Caixa'] },
]

export function getSaldoTotalAtivo() {
  return contas.filter(c => c.ativa).reduce((s, c) => s + c.saldoAtual, 0)
}

export function getContasAtivas() {
  return contas.filter(c => c.ativa)
}

export function getUltimaMovimentacao() {
  return { dataHora: 'Hoje, 14:32', contaNome: 'BTG Empresarial' }
}

export function getNextId() {
  _contaIdSeq++
  return `CF00${_contaIdSeq}`
}

export function getNextNumero() {
  return `#${String(_contaIdSeq).padStart(3, '0')}`
}

export function addConta(novaConta) {
  contas.push(novaConta)
  if (!movimentacoesPorConta[novaConta.id]) {
    movimentacoesPorConta[novaConta.id] = []
  }
  if (movimentacoesFuturas[novaConta.id] === undefined) {
    movimentacoesFuturas[novaConta.id] = 0
  }
}

export function inativarConta(id) {
  const c = contas.find(c => c.id === id)
  if (c) c.ativa = false
}
