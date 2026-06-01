import { useState } from 'react'
import { useLocation } from 'wouter'
import { Fingerprint, Wallet, Settings, Shield, Info, ChevronDown } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { toast } from '../../hooks/use-toast'
import { addConta, contas, getNextId, getNextNumero } from '../../data/contasMock'
import { historico } from '../../data/index'

const BANCOS = [
  'Itaú Unibanco', 'Bradesco', 'Santander', 'Banco do Brasil',
  'Nubank', 'Caixa Econômica', 'BTG Pactual', 'XP Invest', 'Safra', 'Outros',
]

export default function NovaConta() {
  const [, navigate] = useLocation()

  const [form, setForm] = useState({
    nome: '',
    banco: '',
    agencia: '',
    conta: '',
    cnpjTitular: '',
    saldoInicial: '',
    dataAbertura: '',
    ativa: true,
    contaPadrao: false,
  })

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSalvar = () => {
    if (!form.nome.trim()) {
      toast({ title: 'Preencha o nome da conta', variant: 'destructive' })
      return
    }

    const newId = getNextId()
    const newNumero = getNextNumero()

    const novaConta = {
      id: newId,
      numero: newNumero,
      nome: form.nome,
      banco: form.banco || 'Outros',
      agencia: form.agencia || '-',
      conta: form.conta || '-',
      cnpjTitular: form.cnpjTitular,
      saldoInicial: parseFloat(form.saldoInicial) || 0,
      saldoAtual: parseFloat(form.saldoInicial) || 0,
      dataAbertura: form.dataAbertura || new Date().toISOString().split('T')[0],
      ultimaConciliacao: new Date().toISOString().split('T')[0],
      ativa: form.ativa,
      contaPadrao: form.contaPadrao,
    }

    addConta(novaConta)

    const newHistId = `HIS${String(historico.length + 1).padStart(3, '0')}`
    historico.unshift({
      id: newHistId,
      dataHora: new Date().toISOString(),
      entidade: 'Conta Financeira',
      entidadeId: newId,
      tipoEvento: 'normal',
      usuario: 'usuário atual',
      usuarioId: 'USR001',
      descricaoCompleta: `Criação de conta financeira — ${form.nome}.`,
      camposAlterados: [],
      ipCliente: '192.168.1.100',
      empresa: 'Optsolv',
      filial: 'São Paulo',
    })

    toast({ title: 'Conta criada com sucesso' })
    navigate('/contas-financeiras')
  }

  return (
    <div>
      <PageHeader
        title="Nova Conta Bancária"
        subtitle="Cadastre uma nova instituição financeira para gestão do seu fluxo de caixa."
        actions={
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container">
            <Shield className="w-4 h-4" style={{ color: '#F97316' }} />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Ambiente Seguro</span>
          </div>
        }
      />

      <div className="space-y-5 max-w-3xl">
        {/* IDENTIFICAÇÃO */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Fingerprint className="w-5 h-5" style={{ color: '#F97316' }} />
            <h2 className="text-sm font-bold text-on-surface">Identificação</h2>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Nome da Conta — col-span-8 */}
            <div className="col-span-12 md:col-span-8">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                Nome da Conta *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Ex: Conta Corrente Principal"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </div>

            {/* Banco — col-span-4 */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                Banco
              </label>
              <div className="relative">
                <select
                  value={form.banco}
                  onChange={(e) => set('banco', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                >
                  <option value="">Selecione o Banco</option>
                  {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Agência — col-span-3 */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                Agência
              </label>
              <input
                type="text"
                value={form.agencia}
                onChange={(e) => set('agencia', e.target.value)}
                placeholder="0000"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </div>

            {/* Número da Conta — col-span-4 */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                Número da Conta
              </label>
              <input
                type="text"
                value={form.conta}
                onChange={(e) => set('conta', e.target.value)}
                placeholder="00000-0"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </div>

            {/* CNPJ/CPF — col-span-5 */}
            <div className="col-span-12 md:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                CNPJ/CPF Titular
              </label>
              <input
                type="text"
                value={form.cnpjTitular}
                onChange={(e) => set('cnpjTitular', e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </div>
          </div>
        </div>

        {/* SALDO */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wallet className="w-5 h-5" style={{ color: '#F97316' }} />
            <h2 className="text-sm font-bold text-on-surface">Saldo</h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Left side */}
            <div className="col-span-3 md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                  Saldo Inicial *
                </label>
                <div className="flex items-center border border-surface-container-high bg-surface-container rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-container/30">
                  <span className="px-3 py-2.5 text-sm font-bold text-text-muted border-r border-surface-container-high bg-surface-container-high">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.saldoInicial}
                    onChange={(e) => set('saldoInicial', e.target.value)}
                    placeholder="0,00"
                    className="flex-1 px-3 py-2.5 text-xl font-bold text-on-surface bg-transparent focus:outline-none placeholder:text-text-muted placeholder:font-normal placeholder:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                  Data de Abertura
                </label>
                <input
                  type="date"
                  value={form.dataAbertura}
                  onChange={(e) => set('dataAbertura', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-container-high bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>
            </div>

            {/* Right side — glassmorphism */}
            <div className="col-span-3 md:col-span-1 rounded-xl p-4 flex flex-col gap-3 border border-blue-100"
              style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-on-surface">Informação Importante</p>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                O saldo inicial é o ponto de partida desta conta. Alterações futuras ocorrerão automaticamente
                através de movimentações ou ajustes manuais no sistema.
              </p>
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÃO */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5" style={{ color: '#F97316' }} />
            <h2 className="text-sm font-bold text-on-surface">Configuração</h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-3 md:col-span-2 space-y-4">
              {/* Toggle status */}
              <div className="rounded-xl p-4 border border-surface-container-high bg-surface-container">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Status da Conta</p>
                    <p className="text-xs text-text-muted mt-0.5">Determine se a conta está pronta para uso.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      {form.ativa ? 'ATIVA' : 'INATIVA'}
                    </span>
                    <button
                      type="button"
                      onClick={() => set('ativa', !form.ativa)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.ativa ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.ativa ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox conta padrão */}
              <div className="rounded-xl p-4 border border-surface-container-high bg-surface-container">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.contaPadrao}
                    onChange={(e) => set('contaPadrao', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Conta padrão?</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Ao marcar, esta conta será sugerida por padrão em novos lançamentos financeiros.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Decorative image */}
            <div className="col-span-3 md:col-span-1 rounded-xl overflow-hidden relative min-h-[160px] bg-gray-900 flex items-end">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #F97316, transparent)' }} />
                <div className="absolute text-5xl">🏦</div>
              </div>
              <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
                <p className="text-xs text-white font-medium">
                  Organize suas finanças com a precisão que sua empresa merece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 py-4 px-0 bg-surface-container-lowest border-t border-surface-container">
        <button
          onClick={() => navigate('/contas-financeiras')}
          className="px-6 py-2.5 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSalvar}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}
        >
          Salvar Conta
        </button>
      </div>
    </div>
  )
}
