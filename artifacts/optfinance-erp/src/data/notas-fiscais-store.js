import { vendas } from './vendas-store'

export const notasFiscais = [
  {
    id: 'NF001', numero: 'NF-1024', vendaId: 'VND001', clienteNome: 'AMT Engenharia',
    competencia: '2026-05', valor: 12500.00, status: 'emitida',
    pdfAnexado: true, xmlAnexado: true, dataEmissao: '2026-05-15',
    tipo: 'cliente', localPrestacao: 'São Paulo - SP',
  },
  {
    id: 'NF002', numero: 'NF-1025', vendaId: 'VND002', clienteNome: 'Nexus Tech',
    competencia: '2026-03', valor: 4890.00, status: 'pendente',
    pdfAnexado: false, xmlAnexado: false, dataEmissao: null,
    tipo: 'cliente', localPrestacao: null,
  },
  {
    id: 'NF003', numero: 'NF-1022', vendaId: 'VND006', clienteNome: 'Saúde Total',
    competencia: '2026-05', valor: 22100.50, status: 'emitida',
    pdfAnexado: true, xmlAnexado: true, dataEmissao: '2026-05-10',
    tipo: 'cliente', localPrestacao: 'Campinas - SP',
  },
  {
    id: 'NF004', numero: 'NF-1020', vendaId: 'VND005', clienteNome: 'Metalúrgica SP',
    competencia: '2026-04', valor: 16000.00, status: 'arquivada',
    pdfAnexado: true, xmlAnexado: false, dataEmissao: '2026-04-05',
    tipo: 'cliente', localPrestacao: 'São Paulo - SP',
  },
  {
    id: 'NF005', numero: 'NF-1018', vendaId: 'VND003', clienteNome: 'Pharmavida',
    competencia: '2026-02', valor: 16166.67, status: 'emitida',
    pdfAnexado: true, xmlAnexado: true, dataEmissao: '2026-02-20',
    tipo: 'cliente', localPrestacao: 'Rio de Janeiro - RJ',
  },
  {
    id: 'NF006', numero: 'NFV-0201', vendaId: 'VND001', clienteNome: 'Marcos Oliveira',
    competencia: '2026-05', valor: 1250.00, status: 'emitida',
    pdfAnexado: true, xmlAnexado: true, dataEmissao: '2026-05-16',
    tipo: 'vendedor', localPrestacao: 'São Paulo - SP',
  },
  {
    id: 'NF007', numero: 'NFV-0202', vendaId: 'VND006', clienteNome: 'Pedro Henrique Lima',
    competencia: '2026-05', valor: 2210.05, status: 'pendente',
    pdfAnexado: false, xmlAnexado: false, dataEmissao: null,
    tipo: 'vendedor', localPrestacao: null,
  },
  {
    id: 'NF008', numero: 'NFV-0198', vendaId: 'VND005', clienteNome: 'Marcos Oliveira',
    competencia: '2026-03', valor: 1600.00, status: 'arquivada',
    pdfAnexado: true, xmlAnexado: true, dataEmissao: '2026-03-08',
    tipo: 'vendedor', localPrestacao: 'São Paulo - SP',
  },
]

export function addNotaFiscal(nf) {
  notasFiscais.unshift(nf)
}

export function getNextNfNumero(tipo) {
  const prefix = tipo === 'vendedor' ? 'NFV-' : 'NF-'
  const nums = notasFiscais
    .filter(n => n.tipo === tipo)
    .map(n => parseInt(n.numero.replace(prefix, '')))
    .filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1030
  return `${prefix}${next}`
}

export function getVendasSemNF() {
  const vinculadas = new Set(notasFiscais.map(n => n.vendaId))
  return vendas.filter(v =>
    (v.situacao === 'ativa' || v.situacao === 'encerrada') &&
    !vinculadas.has(v.id)
  )
}

export function markNfAnexada(vendaId) {
  const venda = vendas.find(v => v.id === vendaId)
  if (venda) venda.nfAnexada = true
}
