import { useState } from 'react'
import { useLocation } from 'wouter'
import {
  AlertTriangle, CheckCircle, Upload, Shield, Sparkles, BookOpen,
  X, ChevronDown, ArrowUpCircle, ArrowDownCircle, Check,
} from 'lucide-react'
import PageHeader from '../../../components/shared/PageHeader'
import { contas, linhasExtrato, lancamentosConfirmados } from '../../../data/contasMock'
import { toast } from '../../../hooks/use-toast'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v))

const fmtSigned = (v) =>
  `${v >= 0 ? '+' : '-'} ${fmt(v)}`

const TIPOS_VINCULO = ['Parcela', 'Despesa', 'Novo Lançamento']
const PARCELAS_MOCK = ['Parcela #047 - R$ 1.280,00', 'Parcela #048 - R$ 3.200,00', 'Parcela #049 - R$ 7.500,00']

function Stepper({ step }) {
  const steps = [
    { n: 1, label: 'Importação' },
    { n: 2, label: 'Conferência' },
    { n: 3, label: 'Finalização' },
  ]
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.n ? 'text-white' : 'bg-surface-container text-text-muted'}`}
              style={step >= s.n ? { background: 'linear-gradient(135deg,#F97316,#9D4300)' } : {}}
            >
              {step > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.n ? 'text-on-surface' : 'text-text-muted'}`}>
              {s.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-24 mx-2 mb-4 rounded-full transition-colors ${step > s.n ? 'bg-orange-400' : 'bg-surface-container-high'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function VincularDialog({ linha, onCancel, onConfirm }) {
  const [tipoVinculo, setTipoVinculo] = useState('Parcela')
  const [parcelaSelecionada, setParcelaSelecionada] = useState(PARCELAS_MOCK[0])
  const valorTitulo = 1280.00
  const divergencia = linha ? Math.abs(Math.abs(linha.valor) - valorTitulo) : 0

  if (!linha) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onCancel} />
      <div className="fixed z-[70] inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between p-5 border-b border-surface-container">
            <h2 className="text-base font-bold text-on-surface">Vincular Linha do Extrato</h2>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          <div className="p-5 grid grid-cols-2 gap-5">
            {/* Left: NO EXTRATO */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">No Extrato</p>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Descrição</p>
                <p className="text-sm font-bold text-on-surface">{linha.descricao}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Valor</p>
                <p className="text-lg font-bold" style={{ color: linha.valor >= 0 ? '#22C55E' : '#EF4444' }}>
                  R$ {fmt(linha.valor)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Data</p>
                <p className="text-sm font-medium text-on-surface">{linha.data}</p>
              </div>
            </div>

            {/* Right: NO SISTEMA */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">No Sistema</p>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-widest mb-1">Tipo de Vínculo</label>
                <div className="relative">
                  <select
                    value={tipoVinculo}
                    onChange={(e) => setTipoVinculo(e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface focus:outline-none"
                  >
                    {TIPOS_VINCULO.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-widest mb-1">Selecionar Parcela</label>
                <div className="relative">
                  <select
                    value={parcelaSelecionada}
                    onChange={(e) => setParcelaSelecionada(e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface focus:outline-none"
                  >
                    {PARCELAS_MOCK.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                </div>
              </div>
              <div className="rounded-lg p-3 bg-surface-container">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Valor do Título</p>
                <p className="text-base font-bold text-on-surface">R$ {fmt(valorTitulo)}</p>
              </div>
            </div>
          </div>

          {/* Divergência */}
          {divergencia > 0.01 && (
            <div className="mx-5 mb-4 rounded-xl p-3 border-l-4 flex items-start gap-3" style={{ background: '#FFF7ED', borderColor: '#F97316' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
              <div>
                <p className="text-xs font-bold text-orange-900">Divergência de Valores</p>
                <p className="text-xs text-orange-800 mt-0.5">
                  O valor do extrato é R$ {fmt(divergencia)} {Math.abs(linha.valor) < valorTitulo ? 'menor' : 'maior'} que o título.
                  Deseja registrar a diferença como juros/descontos ou manter parcial?
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-5 border-t border-surface-container">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
            >
              Confirmar Vínculo
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ConciliacaoPage() {
  const [, navigate] = useLocation()
  const [step, setStep] = useState(1)
  const [contaSelecionada, setContaSelecionada] = useState(contas.filter(c => c.ativa)[0]?.id || '')
  const [linhas, setLinhas] = useState(linhasExtrato.map(l => ({ ...l })))
  const [linhaSelecionada, setLinhaSelecionada] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [fileLoaded, setFileLoaded] = useState(false)

  const contaInfo = contas.find(c => c.id === contaSelecionada)
  const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const confirmadas = linhas.filter(l => l.vinculado).length
  const ignoradas = 2
  const pendentes = linhas.filter(l => !l.vinculado).length

  const totalOp = lancamentosConfirmados.reduce((s, l) => s + l.valor, 0)

  return (
    <div>
      <PageHeader
        title="Conciliação Bancária"
        subtitle="Importação e conferência manual de extratos bancários"
      />

      <Stepper step={step} />

      {/* ===== STEP 1: IMPORTAÇÃO ===== */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Warning banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl border-l-4" style={{ background: '#FFF7ED', borderColor: '#F97316' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F97316' }} />
            <p className="text-sm text-orange-900">
              <strong>Atenção:</strong> A importação manual requer conferência detalhada dos saldos finais para garantir a integridade dos registros contábeis.
            </p>
          </div>

          {/* Main card */}
          <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                    Selecionar Conta Bancária
                  </label>
                  <div className="relative">
                    <select
                      value={contaSelecionada}
                      onChange={(e) => setContaSelecionada(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface focus:outline-none"
                    >
                      {contas.filter(c => c.ativa).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} — Ag. {c.agencia}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {contaInfo && (
                  <div className="rounded-xl p-4 bg-surface-container">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Resumo da Conta</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-text-muted">Última Conciliação</p>
                        <p className="text-sm font-bold text-on-surface">
                          {new Date(contaInfo.ultimaConciliacao + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted">Saldo Contábil Atual</p>
                        <p className="text-sm font-bold text-on-surface">{fmtBRL(contaInfo.saldoAtual)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: upload area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Arquivo de Extrato
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${dragging ? 'border-orange-400 bg-orange-50' : 'border-surface-container-high bg-surface-container'} ${fileLoaded ? 'border-green-400 bg-green-50' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); setFileLoaded(true) }}
                  onClick={() => setFileLoaded(true)}
                >
                  {fileLoaded ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-green-500" />
                      <p className="text-sm font-semibold text-green-700">Arquivo carregado!</p>
                      <p className="text-xs text-green-600">extrato_outubro_2023.csv</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#F9731618' }}>
                        <Upload className="w-5 h-5" style={{ color: '#F97316' }} />
                      </div>
                      <p className="text-sm font-semibold text-on-surface">Clique para upload ou arraste</p>
                      <p className="text-xs text-text-muted">Arquivos suportados: CSV, OFX (Max 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-container">
              <button
                onClick={() => navigate('/contas-financeiras')}
                className="px-4 py-2 text-sm font-medium text-on-surface hover:text-text-muted transition-colors"
              >
                Cancelar Operação
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
              >
                Carregar Extrato →
              </button>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Segurança de Dados', desc: 'Processamento criptografado de ponta a ponta seguindo normas ISO 27001.' },
              { icon: Sparkles, label: 'Smart Matching', desc: 'Nossa IA sugere automaticamente correspondências entre extrato e contas a pagar/receber.' },
              { icon: BookOpen, label: 'Histórico Auditoria', desc: 'Cada passo da conciliação é registrado para futura auditoria e compliance.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl bg-surface-container-lowest shadow-sm p-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: '#F9731618' }}>
                  <Icon className="w-4 h-4" style={{ color: '#F97316' }} />
                </div>
                <p className="text-sm font-bold text-on-surface mb-1">{label}</p>
                <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STEP 2: CONFERÊNCIA ===== */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">Linhas do Extrato ({linhas.length})</h2>
              <div className="flex gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Vinculado</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pendente</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container">
                    {['Data', 'Descrição', 'Valor', 'Status', 'Ação'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={linha.id} className="border-b border-surface-container hover:bg-surface-container/40 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-text-muted whitespace-nowrap">{linha.data}</td>
                      <td className="px-4 py-3.5 font-medium text-on-surface">{linha.descricao}</td>
                      <td className="px-4 py-3.5 font-bold whitespace-nowrap" style={{ color: linha.valor >= 0 ? '#22C55E' : '#EF4444' }}>
                        {fmtSigned(linha.valor)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${linha.vinculado ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {linha.vinculado ? 'Vinculado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {!linha.vinculado && (
                          <button
                            onClick={() => setLinhaSelecionada(linha)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-surface-container"
                            style={{ color: '#F97316', borderColor: '#F97316' }}
                          >
                            Vincular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
            >
              Avançar para Finalização →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 3: FINALIZAÇÃO ===== */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Conciliação concluída com sucesso!</p>
              <p className="text-xs text-green-700 mt-0.5">{lancamentosConfirmados.length} lançamentos foram processados e integrados ao sistema.</p>
            </div>
          </div>

          {/* Counter cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Sucesso</p>
              </div>
              <p className="text-3xl font-bold text-on-surface">{lancamentosConfirmados.length}</p>
              <p className="text-xs text-text-muted mt-1">Confirmadas</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">–</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Puladas</p>
              </div>
              <p className="text-3xl font-bold text-on-surface">{ignoradas}</p>
              <p className="text-xs text-text-muted mt-1">Ignoradas</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">!</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">Atenção</p>
              </div>
              <p className="text-3xl font-bold text-on-surface">{pendentes}</p>
              <p className="text-xs text-text-muted mt-1">Pendentes</p>
            </div>
            {pendentes > 0 && (
              <div className="rounded-xl shadow-sm p-5 border-l-4" style={{ background: '#FFF7ED', borderColor: '#F97316' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#F97316' }} />
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Pendências Encontradas</p>
                </div>
                <p className="text-xs text-orange-800 mb-2">
                  Ainda existem {pendentes} lançamentos sem associação. Estes itens não serão processados nesta rodada.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#F97316' }}
                >
                  Resolver Pendências
                </button>
              </div>
            )}
          </div>

          {/* Confirmed table */}
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container">
              <h2 className="text-sm font-bold text-on-surface">
                Lançamentos Confirmados ({lancamentosConfirmados.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container">
                    {['Data', 'Descrição Bancária', 'Categoria ERP', 'Valor', 'Efeito ao Confirmar'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lancamentosConfirmados.map((l, i) => (
                    <tr key={i} className="border-b border-surface-container hover:bg-surface-container/40 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-text-muted whitespace-nowrap">{l.data}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-on-surface">{l.descricaoBancaria}</p>
                        <p className="text-xs text-text-muted">DOC: {l.doc}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.categoriaCor }} />
                          <span className="text-xs text-on-surface">{l.categoriaERP}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold whitespace-nowrap" style={{ color: l.valor >= 0 ? '#22C55E' : '#EF4444' }}>
                        {l.valor >= 0 ? '+' : '-'} {fmt(l.valor)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {l.efeitos.map((e) => (
                            <span
                              key={e}
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${e.includes('Redução') ? 'bg-red-50 text-red-600' : e.includes('Aumento') ? 'bg-green-50 text-green-600' : e.includes('Saída') ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 flex items-center justify-between py-4 border-t border-surface-container bg-surface-container-lowest">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Total da Operação</p>
              <p className="text-base font-bold text-on-surface">
                {fmtBRL(totalOp)}{' '}
                <span className="text-xs font-normal text-text-muted">(Saldo Conciliado)</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  toast({ title: `${lancamentosConfirmados.length} lançamentos confirmados com sucesso` })
                  navigate('/contas-financeiras')
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
              >
                Confirmar {lancamentosConfirmados.length} lançamentos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vincular dialog */}
      <VincularDialog
        linha={linhaSelecionada}
        onCancel={() => setLinhaSelecionada(null)}
        onConfirm={() => {
          if (linhaSelecionada) {
            setLinhas(prev => prev.map(l => l.id === linhaSelecionada.id ? { ...l, vinculado: true } : l))
            setLinhaSelecionada(null)
          }
        }}
      />
    </div>
  )
}
