import { AlertTriangle } from 'lucide-react'
import { toast } from '../../../hooks/use-toast'
import { inativarConta, movimentacoesFuturas } from '../../../data/contasMock'
import { historico } from '../../../data/index'

export default function InativacaoDialog({ open, conta, onCancel, onConfirm }) {
  if (!open || !conta) return null

  const futuras = movimentacoesFuturas[conta.id] || 0

  const handleConfirm = () => {
    inativarConta(conta.id)

    const newId = `HIS${String(historico.length + 1).padStart(3, '0')}`
    historico.unshift({
      id: newId,
      dataHora: new Date().toISOString(),
      entidade: 'Conta Financeira',
      entidadeId: conta.id,
      tipoEvento: 'acao-critica',
      usuario: 'usuário atual',
      usuarioId: 'USR001',
      descricaoCompleta: `Conta inativada — ${conta.nome} (${conta.conta}).`,
      camposAlterados: [{ campo: 'ativa', valorAnterior: 'true', novoValor: 'false' }],
      ipCliente: '192.168.1.100',
      empresa: 'Optsolv',
      filial: 'São Paulo',
    })

    toast({ title: 'Conta inativada com sucesso' })
    onConfirm()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="fixed z-[70] inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 className="text-lg font-bold text-on-surface mb-1">Confirmar Inativação</h2>
          <p className="text-sm text-text-muted mb-5">
            Conta: <strong>{conta.nome}</strong> ({conta.conta})
          </p>

          {/* Warning box */}
          <div className="rounded-xl p-4 mb-5 border-l-4" style={{ background: '#FFF7ED', borderColor: '#F97316' }}>
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
              <div className="text-sm text-orange-900 space-y-2">
                {futuras > 0 ? (
                  <p>
                    Esta conta possui <strong>{futuras} movimentações futuras previstas</strong>. Ao inativar, ela
                    deixará de aparecer como opção de seleção. Movimentações já registradas são preservadas.
                  </p>
                ) : (
                  <p>
                    Conta sem movimentações futuras. Ao inativar, ela deixará de aparecer como opção de seleção.
                  </p>
                )}
                <p className="font-semibold">Deseja continuar?</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
            >
              Inativar mesmo assim
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
