import { useState, useEffect } from 'react'
import parcelasInit from '../data/parcelas.json'
import movimentacoesInit from '../data/movimentacoes.json'
import historicoInit from '../data/historico.json'

// ─── Shared mutable stores ────────────────────────────────────────────────────
// Module-level singletons so mutations are visible across any component that
// reads them via the hooks below (e.g. Parcelas page AND Fluxo de Caixa page).
let _parcelas = parcelasInit.map(p => ({ ...p }))
let _movimentacoes = movimentacoesInit.map(m => ({ ...m }))
let _historico = historicoInit.map(h => ({ ...h }))

let _parcelasListeners = []
let _movListeners = []

function notifyParcelas() { _parcelasListeners.forEach(fn => fn()) }
function notifyMov() { _movListeners.forEach(fn => fn()) }

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Reactive access to the parcelas store. */
export function useParcelas() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1)
    _parcelasListeners.push(fn)
    return () => { _parcelasListeners = _parcelasListeners.filter(l => l !== fn) }
  }, [])
  return { parcelas: _parcelas, registrarPagamento: registrarPagamentoGlobal }
}

/** Reactive access to the movimentacoes store (also updated by registrarPagamento). */
export function useMovimentacoes() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1)
    _movListeners.push(fn)
    return () => { _movListeners = _movListeners.filter(l => l !== fn) }
  }, [])
  return _movimentacoes
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

export function registrarPagamentoGlobal({
  parcelaId, valorRecebido, dataRecebimento, contaId,
  pagamentoParcial, novoVencimento, comprovanteNome, usuario,
}) {
  const idx = _parcelas.findIndex(p => p.id === parcelaId)
  if (idx === -1) return null

  const parcela = { ..._parcelas[idx] }
  const hoje = dataRecebimento || new Date().toISOString().slice(0, 10)

  // Accumulate received value (don't overwrite prior partial payments)
  const prevRecebido = parcela.valorRecebido || 0
  const novoRecebido = prevRecebido + valorRecebido

  if (pagamentoParcial) {
    parcela.situacao = 'pagamento-parcial'
    parcela.valorRecebido = novoRecebido
    if (novoVencimento) parcela.vencimento = novoVencimento
  } else {
    // Full settlement: mark as paga, clamp to valorBruto for safety
    parcela.situacao = 'paga'
    parcela.valorRecebido = Math.min(novoRecebido, parcela.valorBruto)
    parcela.recebimento = hoje
  }

  if (comprovanteNome) parcela.comprovante = comprovanteNome
  if (contaId) parcela.contaFinanceiraId = contaId

  _parcelas[idx] = parcela

  // ── FluxoCaixa inflow entry ──────────────────────────────────────────────
  const novaMovId = `MOV-PAR-${parcelaId}-${Date.now()}`
  _movimentacoes = [
    ..._movimentacoes,
    {
      id: novaMovId,
      data: hoje,
      descricao: `Recebimento — Parcela ${parcela.numero} — ${parcela.clienteNome}`,
      categoria: 'Recebimento de Parcela',
      conta: contaId || parcela.contaFinanceiraId || 'CF001',
      tipo: 'entrada',
      entrada: valorRecebido,
      saida: null,
    },
  ]

  // ── Audit historico entry ────────────────────────────────────────────────
  const novoHisId = `HIS-PAR-${parcelaId}-${Date.now()}`
  _historico = [
    {
      id: novoHisId,
      dataHora: new Date().toISOString(),
      entidade: 'parcelas',
      entidadeId: parcelaId,
      tipoEvento: 'normal',
      acao: 'Recebimento registrado',
      usuario: usuario || 'Admin User',
      usuarioId: 'COL001',
      descricaoCompleta: `Pagamento ${pagamentoParcial ? 'parcial' : 'total'} registrado — Parcela ${parcela.numero} de ${parcela.clienteNome} — R$ ${valorRecebido.toFixed(2)}`,
      camposAlterados: [
        { campo: 'situacao', valorAnterior: _parcelas[idx]?.situacao, novoValor: parcela.situacao },
        { campo: 'valorRecebido', valorAnterior: prevRecebido, novoValor: parcela.valorRecebido },
      ],
      ipCliente: '192.168.1.100',
      empresa: 'Optsolv',
      filial: 'São Paulo',
    },
    ..._historico,
  ]

  // Notify both subscriber pools
  notifyParcelas()
  notifyMov()

  return parcela
}

// ─── Fatura payment mutation ───────────────────────────────────────────────────

export function registrarPagamentoFatura({
  faturaId, nomeCartao, mesReferencia, valorPago, dataPagamento,
  contaDebitadaId, nomeContaDebitada, usuario,
}) {
  const novaMovId = `MOV-FAT-${faturaId}-${Date.now()}`
  _movimentacoes = [
    ..._movimentacoes,
    {
      id: novaMovId,
      data: dataPagamento,
      descricao: `Pagamento fatura ${nomeCartao} ${mesReferencia}`,
      categoria: 'Pagamento de Fatura',
      centroCusto: '',
      conta: nomeContaDebitada,
      tipo: 'saida',
      entrada: null,
      saida: Number(valorPago),
      saldo: null,
      origem: faturaId,
    },
  ]

  const novoHisId = `HIS-FAT-${faturaId}-${Date.now()}`
  _historico = [
    {
      id: novoHisId,
      dataHora: new Date().toISOString(),
      entidade: 'cartao-corporativo',
      entidadeId: faturaId,
      tipoEvento: 'normal',
      acao: 'Pagamento da fatura do cartão',
      usuario: usuario || 'Admin User',
      usuarioId: 'COL001',
      descricaoCompleta: `Pagamento da fatura do cartão ${nomeCartao} referente a ${mesReferencia} — R$ ${Number(valorPago).toFixed(2)}`,
      camposAlterados: [
        { campo: 'status', valorAnterior: 'em-aberto', novoValor: 'pago' },
      ],
      ipCliente: '192.168.1.100',
      empresa: 'Optsolv',
      filial: 'São Paulo',
    },
    ..._historico,
  ]

  notifyMov()
}
