import { Link } from 'wouter'
import { Building, TrendingUp, ArrowUpCircle, ArrowDownCircle, Circle, X } from 'lucide-react'
import { useState } from 'react'
import InativacaoDialog from './InativacaoDialog'
import { movimentacoesPorConta } from '../../../data/contasMock'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function TipoIcon({ tipo }) {
  if (tipo === 'Entrada') return <ArrowUpCircle className="w-3.5 h-3.5 text-green-500" />
  if (tipo === 'Saída') return <ArrowDownCircle className="w-3.5 h-3.5 text-red-500" />
  return <Circle className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
}

export default function ContaSlidePanel({ conta, open, onClose, onUpdate }) {
  const [showInativacao, setShowInativacao] = useState(false)

  const movimentos = conta ? (movimentacoesPorConta[conta.id] || []) : []

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-md bg-surface-container-lowest shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 bg-surface-container border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F9731620' }}>
              <Building className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Conta — {conta?.nome}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mt-0.5">
                Detalhes da Conta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conta && (
            <>
              {/* DADOS DA CONTA */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
                  Dados da Conta
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {[
                    ['Nome', conta.nome],
                    ['Banco', conta.banco],
                    ['Agência', conta.agencia],
                    ['Número da Conta', conta.conta],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-on-surface">{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-0.5">Status</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${conta.ativa ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className={`text-sm font-medium ${conta.ativa ? 'text-green-600' : 'text-text-muted'}`}>
                        {conta.ativa ? 'Ativo para movimentações' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Card */}
              <div className="rounded-xl p-5 bg-surface-container relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-10">
                  <TrendingUp className="w-16 h-16 text-on-surface" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">
                    Saldo Inicial ({conta.dataAbertura ? new Date(conta.dataAbertura + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}):
                    <span className="font-medium text-on-surface ml-1">{fmt(conta.saldoInicial)}</span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-3 mb-1" style={{ color: '#F97316' }}>
                    Saldo Atual Disponível
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold" style={{ color: '#F97316' }}>
                      {fmt(conta.saldoAtual)}
                    </p>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Últimas Movimentações */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
                  Últimas Movimentações
                </p>
                {movimentos.length === 0 ? (
                  <p className="text-xs text-text-muted italic">Nenhuma movimentação registrada.</p>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-surface-container">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-surface-container">
                          {['Data', 'Tipo', 'Origem', 'Valor', 'Saldo'].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {movimentos.map((mov, i) => (
                          <tr key={i} className="border-t border-surface-container hover:bg-surface-container/40 transition-colors">
                            <td className="px-3 py-2.5 text-text-muted whitespace-nowrap">{mov.data}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <TipoIcon tipo={mov.tipo} />
                                <span className="text-on-surface">{mov.tipo}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-text-muted">{mov.origem}</td>
                            <td className="px-3 py-2.5 font-medium whitespace-nowrap" style={{ color: mov.valor >= 0 ? '#22C55E' : '#EF4444' }}>
                              {mov.valor >= 0 ? '+' : ''}{fmt(mov.valor)}
                            </td>
                            <td className="px-3 py-2.5 text-text-muted whitespace-nowrap">
                              {new Intl.NumberFormat('pt-BR').format(mov.saldo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Link href={`/fluxo-de-caixa?contaId=${conta?.id}`}>
                  <p className="text-xs font-semibold mt-3 cursor-pointer hover:underline" style={{ color: '#F97316' }}>
                    Ver todas no Fluxo de Caixa →
                  </p>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-surface-container bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => setShowInativacao(true)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
          >
            Editar Conta
          </button>
        </div>
      </div>

      {/* Inativação Dialog */}
      {conta && (
        <InativacaoDialog
          open={showInativacao}
          conta={conta}
          onCancel={() => setShowInativacao(false)}
          onConfirm={() => {
            setShowInativacao(false)
            onClose()
            onUpdate()
          }}
        />
      )}
    </>
  )
}
