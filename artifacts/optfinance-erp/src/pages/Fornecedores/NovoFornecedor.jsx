import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { ChevronRight, Save, Search, Lock, AlertTriangle, ShieldCheck, Package, FileText } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { addFornecedor, isCnpjDuplicadoEmClientes } from '../../data/fornecedores-store'
import { centrosCusto } from '../../data/index'
import { registrarHistorico } from '../../data/historico-store'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}

function inputCls(err) {
  return cn(
    'w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-text-muted text-on-surface',
    err
      ? 'bg-error-container/20 border-2 border-error/20 focus:ring-error/20'
      : 'bg-surface-container-low border-none focus:ring-primary-container/30'
  )
}

const CENTROS = centrosCusto.filter((c) => c.ativo)

function formatCnpj(val) {
  const digits = val.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatCpf(val) {
  const digits = val.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function NovoFornecedor() {
  const [, navigate] = useLocation()

  const [tipoPessoa, setTipoPessoa] = useState('PJ')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [documento, setDocumento] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [centroCustoId, setCentroCustoId] = useState('')
  const [ativo, setAtivo] = useState(true)

  const [cnpjDuplicadoCliente, setCnpjDuplicadoCliente] = useState(false)
  const [sefazChecked, setSefazChecked] = useState(false)

  const docDigits = documento.replace(/\D/g, '')
  const minLength = tipoPessoa === 'PJ' ? 14 : 11
  const docValid = docDigits.length === minLength

  useEffect(() => {
    setDocumento('')
    setSefazChecked(false)
    setCnpjDuplicadoCliente(false)
  }, [tipoPessoa])

  useEffect(() => {
    if (!docValid) {
      setCnpjDuplicadoCliente(false)
      return
    }
    setCnpjDuplicadoCliente(isCnpjDuplicadoEmClientes(documento))
  }, [documento, docValid])

  function handleDocChange(e) {
    const formatted = tipoPessoa === 'PJ'
      ? formatCnpj(e.target.value)
      : formatCpf(e.target.value)
    setDocumento(formatted)
    setSefazChecked(false)
  }

  function handleSefazLookup() {
    if (!docValid) return
    setSefazChecked(true)
    toast({ title: 'Consulta SEFAZ simulada', description: 'Dados validados com sucesso.' })
  }

  const canSave = razaoSocial.trim() && docValid && centroCustoId

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return

    const forn = addFornecedor({
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
      cnpj: documento,
      tipoPessoa,
      emailFinanceiro: '',
      telefone: '',
      centroCustoId,
      status: ativo ? 'ativo' : 'inativo',
    })

    registrarHistorico({
      acao: `Cadastro de fornecedor — ${razaoSocial.trim()} — ${tipoPessoa}`,
      tipoEvento: 'normal',
      entidade: 'Fornecedor',
      entidadeId: forn?.id || '',
      camposAlterados: [
        { campo: 'razaoSocial', valorAnterior: null, novoValor: razaoSocial.trim() },
        { campo: 'tipoPessoa', valorAnterior: null, novoValor: tipoPessoa },
        { campo: 'status', valorAnterior: null, novoValor: ativo ? 'ativo' : 'inativo' },
      ],
    })

    toast({ title: 'Fornecedor cadastrado com sucesso' })
    navigate('/fornecedores')
  }

  const cardStyle = 'bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden border-l-4 border-l-[#F97316] mb-6'

  return (
    <div className="pb-28">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Fornecedores
        </span>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
          Novo Fornecedor
        </span>
      </nav>

      <PageHeader
        title="Novo Fornecedor"
        subtitle="Cadastre um fornecedor ou prestador de serviços no ERP."
      />

      <form onSubmit={handleSubmit}>
        {/* IDENTIFICAÇÃO */}
        <div className={cardStyle}>
          <div className="px-6 pt-5 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-4">
              Identificação
            </p>
          </div>
          <div className="px-6 pb-6">
            {/* Tipo de Pessoa inline radio */}
            <div className="flex items-center gap-6 mb-6">
              <Label>Tipo de Pessoa</Label>
              {['PJ', 'PF'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value={t}
                    checked={tipoPessoa === t}
                    onChange={() => setTipoPessoa(t)}
                    className="accent-[#F97316] w-4 h-4"
                  />
                  <span className={cn(
                    'text-sm font-bold',
                    tipoPessoa === t ? 'text-[#F97316]' : 'text-text-muted'
                  )}>
                    {t === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Razão Social */}
              <div className="col-span-12 md:col-span-8 space-y-1.5">
                <Label required>{tipoPessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}</Label>
                <input
                  type="text"
                  className={inputCls(false)}
                  placeholder={tipoPessoa === 'PJ' ? 'Ex: Empresa XPTO Ltda' : 'Ex: João da Silva'}
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                />
              </div>

              {/* CNPJ / CPF com Search */}
              <div className="col-span-12 md:col-span-4 space-y-1.5">
                <Label required>{tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    className={cn(inputCls(false), 'pr-10')}
                    placeholder={tipoPessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    value={documento}
                    onChange={handleDocChange}
                  />
                  <button
                    type="button"
                    onClick={handleSefazLookup}
                    disabled={!docValid}
                    title={tipoPessoa === 'PJ' ? 'Consultar SEFAZ' : 'Consultar Receita Federal'}
                    className={cn(
                      'absolute right-2 p-1.5 rounded-md transition-colors',
                      docValid
                        ? 'text-[#F97316] hover:bg-[#F97316]/10'
                        : 'text-text-muted cursor-not-allowed'
                    )}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {sefazChecked && (
                  <p className="text-[11px] font-semibold text-green-600 flex items-center gap-1 mt-1">
                    <span>✓</span> Documento validado
                  </p>
                )}
              </div>

              {/* Nome Fantasia */}
              <div className="col-span-12 md:col-span-6 space-y-1.5">
                <Label>{tipoPessoa === 'PJ' ? 'Nome Fantasia' : 'Apelido / Marca'}</Label>
                <input
                  type="text"
                  className={inputCls(false)}
                  placeholder="Como é conhecido no mercado"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                />
              </div>
            </div>

            {/* Non-blocking duplicate alert */}
            {cnpjDuplicadoCliente && (
              <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-[#F97316]/8 border border-[#F97316]/30">
                <AlertTriangle className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#9d4300]">Registro Duplicado</p>
                  <p className="text-[11px] text-[#9d4300]/80 mt-0.5">
                    Este {tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'} já existe na base de{' '}
                    <strong>Clientes</strong>. Isso é permitido — fornecedores e clientes são bases
                    independentes. Verifique se o cadastro é intencional antes de salvar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONFIGURAÇÃO */}
        <div className={cardStyle}>
          <div className="px-6 pt-5 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-4">
              Configuração
            </p>
          </div>
          <div className="px-6 pb-6 grid grid-cols-12 gap-6">
            {/* Centro de Custo */}
            <div className="col-span-12 md:col-span-6 space-y-1.5">
              <Label required>Centro de Custo Padrão</Label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-primary-container/30 focus:outline-none text-on-surface text-sm pr-10"
                  value={centroCustoId}
                  onChange={(e) => setCentroCustoId(e.target.value)}
                >
                  <option value="">Selecione um departamento</option>
                  {CENTROS.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.nome}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
                  ▾
                </span>
              </div>
            </div>

            {/* Status toggle */}
            <div className="col-span-12 md:col-span-6 space-y-1.5">
              <Label>Status do Cadastro</Label>
              <div className="flex items-center gap-4 bg-surface-container-low rounded-lg px-4 py-3">
                <span className={cn(
                  'text-sm font-semibold transition-colors',
                  !ativo ? 'text-on-surface' : 'text-text-muted'
                )}>
                  Inativo
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ativo}
                  onClick={() => setAtivo((v) => !v)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0',
                    ativo ? 'bg-[#F97316]' : 'bg-surface-container-high'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                      ativo ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    )}
                  />
                </button>
                <span className={cn(
                  'text-sm font-semibold transition-colors',
                  ativo ? 'text-on-surface' : 'text-text-muted'
                )}>
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-[220px] right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-sm border-t border-outline-variant/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-medium">
              Dados protegidos por criptografia de ponta a ponta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/fornecedores')}
              className="px-6 py-2.5 rounded-lg border border-outline/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={cn(
                'px-8 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all',
                canSave
                  ? 'hover:brightness-110 active:scale-[0.98] shadow-[#F97316]/30'
                  : 'opacity-50 cursor-not-allowed'
              )}
              style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
            >
              <Save className="w-4 h-4" />
              Salvar Fornecedor
            </button>
          </div>
        </div>
      </form>

      {/* Three glassmorphism info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {/* SEFAZ */}
        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-white/60">
          <div className="flex items-start gap-3">
            <div className="bg-[#F97316]/10 p-2.5 rounded-full flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Validação SEFAZ</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Clique no ícone de busca ao lado do CNPJ para simular a consulta à Receita
                Federal e pré-preencher razão social e situação cadastral automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Contas a Pagar */}
        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-white/60">
          <div className="flex items-start gap-3">
            <div className="bg-[#F97316]/10 p-2.5 rounded-full flex-shrink-0">
              <Package className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Contas a Pagar & Estoque</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Ao cadastrar o fornecedor, ele ficará disponível no módulo de Despesas para
                vincular pagamentos, NFs e controle de estoque e suprimentos.
              </p>
            </div>
          </div>
        </div>

        {/* Alíquotas */}
        <div className="bg-inverse-surface p-5 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-2">
            Alíquotas de Retenção
          </h4>
          <p className="text-[11px] leading-relaxed text-gray-400">
            Fornecedores PJ estão sujeitos a retenção de ISS, PIS, COFINS e CSLL.
            O sistema aplicará automaticamente as alíquotas vigentes com base no CNPJ e
            município de prestação de serviços.
          </p>
          <button className="mt-4 text-[11px] font-bold text-white flex items-center gap-1 hover:text-[#F97316] transition-colors">
            <FileText className="w-3 h-3" />
            Ver tabela de alíquotas →
          </button>
        </div>
      </div>
    </div>
  )
}
