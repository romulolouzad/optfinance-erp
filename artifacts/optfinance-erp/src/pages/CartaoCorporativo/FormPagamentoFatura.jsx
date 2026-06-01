import { useState } from 'react'
import { Info } from 'lucide-react'
import { contasFinanceiras } from '../../data/index'
import { useToast } from '../../hooks/use-toast'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const hoje = () => new Date().toISOString().slice(0, 10)

const CONTAS_BANCARIAS = contasFinanceiras.filter(c => c.ativa && c.tipo !== 'cartão')

export default function FormPagamentoFatura({ fatura, cartao, mesLabel, onSalvar, onClose }) {
  const { toast } = useToast()

  const [dataPagamento, setDataPagamento] = useState(hoje())
  const [valorPago, setValorPago] = useState(fatura?.valorTotal ?? 0)
  const [contaDebitoId, setContaDebitoId] = useState(CONTAS_BANCARIAS[0]?.id ?? '')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleSalvar(e) {
    e.preventDefault()
    if (!dataPagamento || !valorPago || !contaDebitoId) return
    setSalvando(true)

    const contaDebitada = CONTAS_BANCARIAS.find(c => c.id === contaDebitoId)

    onSalvar({
      valorPago: Number(valorPago),
      dataPagamento,
      contaDebitadaId: contaDebitada.id,
      nomeContaDebitada: contaDebitada.nome,
      observacao,
    })

    toast({ title: 'Pagamento da fatura registrado com sucesso' })
    setSalvando(false)
  }

  if (!fatura) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-lg border border-[var(--color-border)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-bold text-on-surface leading-tight">
            Registrar pagamento da fatura<br />
            <span className="font-normal text-sm text-text-muted">{cartao.nome} — {mesLabel}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container text-text-muted transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-6 py-3 px-4 rounded-lg bg-surface-container text-sm">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-label font-semibold mb-0.5">Total da fatura</p>
              <p className="font-bold text-on-surface">{fmt(fatura.valorTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-label font-semibold mb-0.5">Vencimento</p>
              <p className="font-medium text-on-surface">{new Date(fatura.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
            <span>O pagamento da fatura é um evento separado dos gastos individuais. Um lançamento de saída será criado no Extrato de Movimentações.</span>
          </div>

          <form id="form-pagamento" onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1.5">
                Data de pagamento <span className="text-error">*</span>
              </label>
              <input
                type="date"
                required
                value={dataPagamento}
                onChange={e => setDataPagamento(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1.5">
                Valor pago (R$) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={valorPago}
                onChange={e => setValorPago(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1.5">
                Conta financeira de débito <span className="text-error">*</span>
              </label>
              <select
                required
                value={contaDebitoId}
                onChange={e => setContaDebitoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma conta...</option>
                {CONTAS_BANCARIAS.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1.5">
                Observação
              </label>
              <textarea
                rows={2}
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-pagamento"
            disabled={salvando}
            className="px-5 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Registrar pagamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
