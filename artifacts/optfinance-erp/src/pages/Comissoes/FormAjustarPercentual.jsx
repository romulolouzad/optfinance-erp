import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FormAjustarPercentual({ comissao, onClose, onConfirm }) {
  const [novoPercentual, setNovoPercentual] = useState('')
  const [motivo, setMotivo] = useState('')
  const [errors, setErrors] = useState({})

  const novoValorCalculado = novoPercentual
    ? (parseFloat(novoPercentual) / 100) * comissao.valorBase
    : null

  function validate() {
    const errs = {}
    const pct = parseFloat(novoPercentual)
    if (!novoPercentual || isNaN(pct) || pct <= 0) {
      errs.percentual = 'Informe um percentual válido maior que zero.'
    }
    if (pct > 100) errs.percentual = 'Percentual não pode ser maior que 100%.'
    if (!motivo.trim()) errs.motivo = 'O motivo do ajuste é obrigatório.'
    return errs
  }

  function handleSalvar() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onConfirm({
      comissaoId: comissao.id,
      percentualAnterior: comissao.percentual,
      novoPercentual: parseFloat(novoPercentual),
      novoValor: novoValorCalculado,
      motivo: motivo.trim(),
    })
  }

  if (!comissao) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container">
          <div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">Ajustar % de Comissão</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {comissao.vendedor} — {comissao.clienteNome} · Parcela {comissao.parcelaNumero}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Ação crítica aviso */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium">
              Esta é uma ação crítica. O ajuste será registrado no histórico com data e hora.
            </p>
          </div>

          {/* Percentual atual (readonly) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Percentual Atual
            </label>
            <div className="px-4 py-2.5 text-sm rounded-xl bg-surface-container text-on-surface font-bold">
              {comissao.percentual}%
              <span className="text-text-muted font-normal ml-2">({fmt(comissao.valor)})</span>
            </div>
          </div>

          {/* Novo percentual */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Novo Percentual <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.1"
                value={novoPercentual}
                onChange={e => { setNovoPercentual(e.target.value); setErrors(er => ({ ...er, percentual: undefined })) }}
                placeholder="Ex: 7.5"
                className={cn(
                  'w-full pl-4 pr-10 py-2.5 text-sm rounded-xl bg-surface-container-low',
                  'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow',
                  errors.percentual ? 'ring-2 ring-error' : ''
                )}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">%</span>
            </div>
            {errors.percentual && <p className="text-xs text-error mt-1">{errors.percentual}</p>}

            {/* Preview do novo valor */}
            {novoValorCalculado !== null && !isNaN(novoValorCalculado) && novoValorCalculado > 0 && (
              <p className="text-xs text-text-muted mt-1.5">
                Novo valor da comissão:{' '}
                <span className="font-semibold text-on-surface">{fmt(novoValorCalculado)}</span>
                {novoValorCalculado > comissao.valor && (
                  <span className="text-green-600 font-semibold ml-1">(+{fmt(novoValorCalculado - comissao.valor)})</span>
                )}
                {novoValorCalculado < comissao.valor && (
                  <span className="text-error font-semibold ml-1">({fmt(novoValorCalculado - comissao.valor)})</span>
                )}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-label text-text-muted block mb-1.5">
              Motivo do Ajuste <span className="text-error">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setErrors(er => ({ ...er, motivo: undefined })) }}
              placeholder="Descreva o motivo do ajuste do percentual..."
              rows={3}
              className={cn(
                'w-full px-4 py-2.5 text-sm rounded-xl bg-surface-container-low resize-none',
                'text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-shadow',
                errors.motivo ? 'ring-2 ring-error' : ''
              )}
            />
            {errors.motivo && <p className="text-xs text-error mt-1">{errors.motivo}</p>}
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
            onClick={handleSalvar}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:shadow-md active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
          >
            Salvar Ajuste
          </button>
        </div>
      </div>
    </div>
  )
}
