import { useState, useRef, useCallback } from 'react'
import { X, Upload, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { contasFinanceiras } from '../../data/index'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FormRegistrarParcela({ parcela, onClose, onConfirm }) {
  const hoje = new Date().toISOString().slice(0, 10)

  const [valorRecebido, setValorRecebido] = useState(parcela?.valor ?? 0)
  const [dataRecebimento, setDataRecebimento] = useState(hoje)
  const [contaId, setContaId] = useState('CF001')
  const [pagamentoParcial, setPagamentoParcial] = useState(false)
  const [novoVencimento, setNovoVencimento] = useState('')
  const [comprovante, setComprovante] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState({})
  const fileRef = useRef()

  const contasAtivas = contasFinanceiras.filter((c) => c.ativa && c.tipo !== 'cartão')

  function handleFile(file) {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({ ...e, comprovante: 'Formato inválido. Use PDF, JPG ou PNG.' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, comprovante: 'Arquivo muito grande. Máximo 10 MB.' }))
      return
    }
    setErrors((e) => ({ ...e, comprovante: undefined }))
    setComprovante(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  function validate() {
    const errs = {}
    if (!valorRecebido || valorRecebido <= 0) errs.valor = 'Informe um valor válido.'
    if (!dataRecebimento) errs.data = 'Informe a data de recebimento.'
    if (!contaId) errs.conta = 'Selecione a conta bancária.'
    if (pagamentoParcial && !novoVencimento)
      errs.novoVencimento = 'Informe o novo vencimento do saldo restante.'
    if (pagamentoParcial && valorRecebido >= (parcela?.valor ?? 0))
      errs.valor = 'Para pagamento parcial, o valor deve ser menor que o total em aberto.'
    return errs
  }

  function handleConfirm() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onConfirm({
      parcelaNumero: parcela?.numero,
      valorRecebido: Number(valorRecebido),
      dataRecebimento,
      contaId,
      pagamentoParcial,
      novoVencimento: pagamentoParcial ? novoVencimento : null,
      comprovanteNome: comprovante ? comprovante.name : null,
    })
  }

  if (!parcela) return null

  const saldoRestante = (parcela.valor ?? 0) - valorRecebido

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container">
          <div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              Registrar Recebimento
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Parcela {parcela.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container p-3">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                Valor da Parcela
              </p>
              <p className="text-sm font-bold text-on-surface">{fmt(parcela.valor)}</p>
            </div>
            <div className="rounded-xl bg-surface-container p-3">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                Vencimento
              </p>
              <p className="text-sm font-bold text-on-surface">
                {parcela.vencimento
                  ? new Date(parcela.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            </div>
          </div>

          {/* Valor Recebido */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Valor Recebido <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">
                R$
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                className={cn(
                  'w-full pl-9 pr-4 py-3 text-xl font-bold rounded-xl bg-surface-container-low',
                  'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow',
                  errors.valor ? 'ring-2 ring-error' : '',
                )}
              />
            </div>
            {errors.valor && <p className="text-xs text-error mt-1">{errors.valor}</p>}
            {pagamentoParcial && valorRecebido > 0 && saldoRestante > 0 && (
              <p className="text-xs text-text-muted mt-1.5">
                Saldo restante:{' '}
                <span className="font-semibold text-on-surface">{fmt(saldoRestante)}</span>
              </p>
            )}
          </div>

          {/* Data do Recebimento */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Data do Recebimento <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={dataRecebimento}
              onChange={(e) => setDataRecebimento(e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 text-sm rounded-xl bg-surface-container-low',
                'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow',
                errors.data ? 'ring-2 ring-error' : '',
              )}
            />
            {errors.data && <p className="text-xs text-error mt-1">{errors.data}</p>}
          </div>

          {/* Conta Bancária */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Conta Bancária <span className="text-error">*</span>
            </label>
            <select
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 text-sm rounded-xl bg-surface-container-low appearance-none',
                'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow cursor-pointer',
                errors.conta ? 'ring-2 ring-error' : '',
              )}
            >
              <option value="">Selecione a conta...</option>
              {contasAtivas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.banco}
                </option>
              ))}
            </select>
            {errors.conta && <p className="text-xs text-error mt-1">{errors.conta}</p>}
          </div>

          {/* Comprovante drag-and-drop */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Comprovante de Pagamento
            </label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all',
                dragging
                  ? 'border-primary-container bg-primary-container/10'
                  : comprovante
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-surface-container-high bg-surface-container hover:border-primary-container/50 hover:bg-primary-container/5',
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {comprovante ? (
                <div className="flex flex-col items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-on-surface truncate max-w-xs">
                    {comprovante.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(comprovante.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setComprovante(null)
                    }}
                    className="text-xs text-error hover:underline mt-1"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-text-muted" />
                  <p className="text-sm text-text-muted">
                    Arraste o arquivo aqui ou{' '}
                    <span className="text-primary-container font-semibold">
                      clique para selecionar
                    </span>
                  </p>
                  <p className="text-xs text-text-muted">PDF, JPG ou PNG — máx. 10 MB</p>
                </div>
              )}
            </div>
            {errors.comprovante && (
              <p className="text-xs text-error mt-1">{errors.comprovante}</p>
            )}
          </div>

          {/* Pagamento Parcial Toggle */}
          <div className="rounded-xl bg-surface-container p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">Pagamento Parcial</p>
                <p className="text-xs text-text-muted mt-0.5">
                  O valor recebido é menor que o saldo em aberto
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPagamentoParcial((p) => !p)
                  setErrors((e) => ({ ...e, novoVencimento: undefined }))
                }}
                className="transition-colors flex-shrink-0"
              >
                {pagamentoParcial ? (
                  <ToggleRight className="w-8 h-8 text-primary-container" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-text-muted" />
                )}
              </button>
            </div>

            {pagamentoParcial && (
              <div className="mt-4 pt-4 border-t border-surface-container-high">
                <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
                  Novo vencimento do saldo restante <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={novoVencimento}
                  min={hoje}
                  onChange={(e) => setNovoVencimento(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl bg-surface-container-low',
                    'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow',
                    errors.novoVencimento ? 'ring-2 ring-error' : '',
                  )}
                />
                {errors.novoVencimento && (
                  <p className="text-xs text-error mt-1">{errors.novoVencimento}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-container border-t border-surface-container-high">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:shadow-md active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
          >
            Confirmar Recebimento
          </button>
        </div>
      </div>
    </div>
  )
}
