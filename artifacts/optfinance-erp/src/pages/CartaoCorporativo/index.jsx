import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle, CreditCard } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import { contasFinanceiras, faturasCartao, centrosCusto } from '../../data/index'
import { useAuth } from '../../context/AuthContext'
import { registrarPagamentoFatura } from '../../hooks/useParcelas'
import FormPagamentoFatura from './FormPagamentoFatura'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function mesLabel(yyyyMM) {
  const [year, month] = yyyyMM.split('-')
  return `${MESES_PT[parseInt(month, 10) - 1]} ${year}`
}

function mesAtualYYYYMM() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function addMes(yyyyMM, delta) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const CARTOES = contasFinanceiras.filter(c => c.tipo === 'cartão' && c.ativa)

const getNomeCentroCusto = (id) => {
  if (!id) return null
  const cc = centrosCusto.find(c => c.id === id)
  return cc?.nome ?? id
}

export default function CartaoCorporativoPage() {
  const { perfil } = useAuth()
  const mesCorrente = mesAtualYYYYMM()

  const [cartaoId, setCartaoId] = useState(CARTOES[0]?.id ?? '')
  const [mesAtivo, setMesAtivo] = useState(mesCorrente)
  const [faturas, setFaturas] = useState(faturasCartao)
  const [modalAberto, setModalAberto] = useState(false)

  const cartaoSelecionado = CARTOES.find(c => c.id === cartaoId) ?? null

  const fatura = useMemo(() => {
    if (!cartaoId) return null
    return faturas.find(f => f.contaFinanceiraId === cartaoId && f.mesReferencia === mesAtivo) ?? null
  }, [faturas, cartaoId, mesAtivo])

  const podeRegistrarPagamento =
    fatura &&
    fatura.status === 'em-aberto' &&
    (perfil === 'admin' || perfil === 'financeiro')

  function navegarMes(delta) {
    const proximo = addMes(mesAtivo, delta)
    if (delta > 0 && proximo > mesCorrente) return
    setMesAtivo(proximo)
  }

  function handleSalvarPagamento({ valorPago, dataPagamento, contaDebitadaId, nomeContaDebitada }) {
    registrarPagamentoFatura({
      faturaId: fatura.id,
      nomeCartao: cartaoSelecionado.nome,
      mesReferencia: fatura.mesReferencia,
      valorPago,
      dataPagamento,
      contaDebitadaId,
      nomeContaDebitada,
      usuario: 'Admin User',
    })
    setFaturas(prev =>
      prev.map(f =>
        f.id === fatura.id ? { ...f, status: 'pago' } : f
      )
    )
    setModalAberto(false)
  }

  const totalGastos = fatura
    ? fatura.composicao.reduce((s, i) => s + i.valor, 0)
    : 0

  const columns = [
    {
      header: 'Data da compra',
      accessor: 'data',
      cell: r => new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR'),
    },
    {
      header: 'Descrição',
      accessor: 'descricao',
      cell: r => <span className="font-medium">{r.descricao}</span>,
    },
    { header: 'Categoria', accessor: 'categoria' },
    {
      header: 'Parcela',
      accessor: 'parcela',
      cell: r => r.parcela ?? '—',
    },
    {
      header: 'Valor',
      accessor: 'valor',
      align: 'right',
      cell: r => <span className="font-semibold text-error">{fmt(r.valor)}</span>,
    },
    {
      header: 'Centro de custo',
      accessor: 'centroCustoId',
      cell: r => {
        if (!r.centroCustoId) {
          return (
            <span className="flex items-center gap-1 text-error text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Sem centro de custo
            </span>
          )
        }
        return getNomeCentroCusto(r.centroCustoId)
      },
    },
    {
      header: 'Competência',
      accessor: 'competencia',
      cell: r => {
        const [y, m] = (r.competencia ?? '').split('-')
        return m && y ? `${m}/${y}` : r.competencia ?? '—'
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Cartão Corporativo"
        subtitle="Acompanhe os gastos mensais e o pagamento da fatura"
      />

      {CARTOES.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-[var(--color-border)] text-center">
          <CreditCard className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-base font-semibold text-on-surface mb-1">Nenhum cartão corporativo cadastrado</p>
          <p className="text-sm text-text-muted max-w-xs">
            Cadastre uma conta do tipo Cartão Corporativo em Contas Financeiras.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm font-semibold text-text-muted shrink-0">Selecionar cartão:</label>
            <select
              value={cartaoId}
              onChange={e => setCartaoId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-w-[220px]"
            >
              {CARTOES.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navegarMes(-1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors border border-[var(--color-border)]"
            >
              <ChevronLeft className="w-4 h-4" />
              Mês anterior
            </button>
            <span className="text-base font-bold text-on-surface">
              {mesLabel(mesAtivo)}
            </span>
            <button
              onClick={() => navegarMes(1)}
              disabled={addMes(mesAtivo, 1) > mesCorrente}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors border border-[var(--color-border)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo mês
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!fatura ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center mb-6">
              <p className="text-sm text-text-muted">
                Nenhuma fatura disponível para <strong>{mesLabel(mesAtivo)}</strong>. Os gastos do período podem não ter sido importados.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-5 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-label font-semibold mb-0.5">Valor total da fatura</p>
                    <p className="text-2xl font-bold text-on-surface">{fmt(fatura.valorTotal)}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-label font-semibold mb-0.5">Vencimento</p>
                      <p className="text-sm font-medium text-on-surface">
                        {new Date(fatura.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-label font-semibold mb-0.5">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        fatura.status === 'pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fatura.status === 'pago' ? 'Paga' : 'Aberta'}
                      </span>
                    </div>
                  </div>
                </div>
                {podeRegistrarPagamento && (
                  <button
                    onClick={() => setModalAberto(true)}
                    className="px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold"
                  >
                    Registrar pagamento
                  </button>
                )}
              </div>
            </div>
          )}

          {fatura && (
            fatura.composicao.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-[var(--color-border)] text-center">
                <CreditCard className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-sm font-medium text-on-surface">Nenhum lançamento encontrado para este período.</p>
              </div>
            ) : (
              <div>
                <DataTable
                  columns={columns}
                  data={fatura.composicao}
                  keyField="id"
                />
                <div className="mt-3 px-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-text-muted">
                  <span>{fatura.composicao.length} lançamento{fatura.composicao.length !== 1 ? 's' : ''}</span>
                  <span className="font-semibold text-on-surface">Total: {fmt(totalGastos)}</span>
                  <span className="italic">O pagamento da fatura é um evento separado no fluxo de caixa.</span>
                </div>
              </div>
            )
          )}
        </>
      )}

      {modalAberto && fatura && cartaoSelecionado && (
        <FormPagamentoFatura
          fatura={fatura}
          cartao={cartaoSelecionado}
          mesLabel={mesLabel(mesAtivo)}
          onSalvar={handleSalvarPagamento}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}
